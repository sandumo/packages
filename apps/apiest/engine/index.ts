import { DataProcessor } from './data.processor';
import { FilterProcessor } from './filter.processor';
import { BaseAction, NestedObject, PermissionParser } from './permissions';
import { PrismaAdapter } from './prisma.adapter';
import { Tree } from './tree';
import { Language, Query, QueryFilter, Resource, Schema, User } from './types';
import { isObject } from './utils';

export class App {
  private schema: Schema;
  private resource: Resource;
  private user: User;
  private language: Language;
  private query: Query;

  private permissionParser: PermissionParser;
  private filterProcessor: FilterProcessor;
  private prismaAdapter: PrismaAdapter;

  // computed permissions
  private permissions: string[];
  private ownerPermissions: string[];

  private action: BaseAction;

  // data: DataProcessor;

  private data: any;

  constructor(
    schema: Schema,
    resource: Resource,
    user: User,
    language: Language,
    query: Query,
    action: BaseAction,
    data: any,
  ) {
    this.schema = schema;
    this.resource = resource;
    this.user = user;
    this.language = language;
    this.query = query;
    this.action = action;
    this.permissionParser = new PermissionParser(schema, user._permissions);
    this.filterProcessor = new FilterProcessor();
    this.prismaAdapter = new PrismaAdapter(schema, language, query);
    // this.data = new DataProcessor();
    this.data = data;
  }

  do() {
    // build the tree:
    // console.log(this.schema.permissions);

    // console.log('[x] permissions', permissions);

    // const tree = this.getTree();
    // console.log('[x] tree', tree);

    // const select = this.prismaAdapter.getSelect(this.resource, this.getTree());

    const tree = this.getTree();

    console.log('[x] tree', tree);
  }

  getIncludeFromData(data: any) {
    const include = [];

    return Object.keys(data)
      .filter((key) => isObject(data[key]))
      .flatMap((key) => {
        const sub = this.getIncludeFromData(data[key]);

        console.log('[x] sub', sub);

        return sub.map((subKey) => `${key}.${subKey}`);
      });
  }

  getSelect() {
    const tree = this.getTree();

    // console.log('[x] getSelect tree=', tree);

    if (!tree || Object.keys(tree).length === 0) {
      return null;
    }

    return this.prismaAdapter.getSelect(this.resource, tree);
  }

  getFilter() {
    const permissionFilter = this.permissionParser.getConditionsFilter(
      this.action,
      this.resource,
      [...this.getPermissions(), ...this.getOwnerPermissions()],
    );

    const filter: QueryFilter = {
      and: [this.query.filter, permissionFilter].filter(
        Boolean,
      ) as QueryFilter[],
    };

    // console.log('[x] filter=', JSON.stringify(filter, null, 2));

    const castedFilter = this.filterProcessor.castFilter(filter, this.resource); // filter.processor.ts

    // console.log('[x] castedFilter=', JSON.stringify(castedFilter, null, 2));

    // const prismaFilter = transformToPrismaFilter(castedFilter); // prisma.adapter.ts

    return this.prismaAdapter.getFilter(castedFilter);
  }

  private tree: NestedObject;


  getTree() {
    if (this.tree) return this.tree;

    if (!this.resource.ownable || !this.user) {
      this.tree = this.getNonOwnerTree();

      return this.tree;
    }

    // check if empty nonOwnerTree
    if (Object.keys(this.getNonOwnerTree()).length === 0) {
      this.tree = this.getOwnerTree();

      return this.tree;
    }

    this.tree =
      this.permissionParser.mergeTwo(
        this.getNonOwnerTree(),
        this.getOwnerTree(),
      ) || {};

    return this.tree;
  }

  private nonOwnerTree: NestedObject;

  private getNonOwnerTree() {
    if (this.nonOwnerTree) return this.nonOwnerTree;

    this.nonOwnerTree = this.getTreeFromPermissions(this.getPermissions());

    return this.nonOwnerTree;
  }

  private ownerTree: NestedObject;

  private getOwnerTree() {
    if (this.ownerTree) return this.ownerTree;

    if (!this.resource.ownable || !this.user) {
      this.ownerTree = {};

      return this.ownerTree;
    }

    this.ownerTree = this.getTreeFromPermissions(this.getOwnerPermissions());

    return this.ownerTree;
  }

  private getTreeFromPermissions(permissions: string[]) {
    return (
      this.permissionParser.tree(
        this.action,
        this.resource,
        ['list', 'read'].includes(this.action) ? this.query.include : null,
        permissions,
        ['create', 'update'].includes(this.action) ? this.data : null,
      ) || {}
    );
  }

  /**
   * Get the permissions for the user. Takes into account the user's role and user's permissions.
   */
  private getPermissions(): string[] {
    if (this.permissions) return this.permissions;

    const permissions: string[] = [];

    permissions.push(...this.schema.permissions.anyone);

    // authenticated user
    if (this.user) {
      permissions.push(...this.user._permissions);
      permissions.push(...this.schema.permissions.user);

      // root user
      if (this.user.id === 1) {
        permissions.push(...this.schema.permissions.root);
      }
    }
    // unauthenticated user
    else {
      permissions.push(...this.schema.permissions.guest);
    }

    this.permissions = this.permissionParser.filterPermissions(
      permissions,
      this.action,
    );

    return this.permissions;
  }

  private getOwnerPermissions(): string[] {
    if (this.ownerPermissions) return this.ownerPermissions;

    // owner's permissions
    if (this.resource.ownable && this.user) {
      this.ownerPermissions = this.permissionParser.filterPermissions(
        this.schema.permissions.owner,
        this.action,
      );
    } else {
      this.ownerPermissions = [];
    }

    return this.ownerPermissions;
  }

  /**
   * Postprocess the data to include translations and references
   */
  postProcess(data: any) {
    const process = (data: any) => {
      const resultData = this.prismaAdapter.postProcessRecursive(
        this.resource,
        data,
      );

      // return resultData;

      if (
        this.resource.ownable &&
        this.user &&
        resultData.owner.id !== this.user.id
      ) {
        return Tree.filter(resultData, this.getNonOwnerTree());
      }

      return Tree.filter(resultData, this.getTree());
    };

    if (Array.isArray(data)) {
      return data.map((item) => process(item));
    }

    return process(data);
  }
}

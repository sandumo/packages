import { QueryFilter, Resource, Schema } from './types';
import { isObject } from './utils';

export type BaseAction = 'read' | 'list' | 'create' | 'update' | 'delete';

type RecField = {
  except?: boolean;
  attributes: {
    [key: string]: RecField | true;
  };
};

export type NestedObject = {
  [key: string]: boolean | NestedObject;
};

/**
 * How it works:
 * - build permission tree
 *   - filter permissions by action
 *   - parse each permission into a nested object
 *   - merge all nested objects into a single tree
 * - build requested tree
 *   - build relational tree (includes)
 *   - build the requested tree based on schema and relational tree
 * - build the final tree
 *   - recursively intersect permission tree with requested tree
 *     - merge relational permissions with related resource permissions
 */
export class PermissionParser {
  private schema: Schema;
  private permissions: string[];

  // computed
  private permissionTree: NestedObject;

  constructor(schema: Schema, permissions: string[]) {
    this.schema = schema;
    this.permissions = permissions;
  }

  toPrismaSelect(attributes: NestedObject) {
    return Object.keys(attributes).reduce((acc, attribute) => {
      if (typeof attributes[attribute] === 'boolean') {
        if (attributes[attribute]) {
          acc[attribute] = true;
        }
      } else {
        acc[attribute] = {
          select: attributes[attribute],
        };
      }

      return acc;
    }, {});
  }

  tree(
    action: BaseAction,
    resource: Resource,
    include: string[] | null,
    permissions: string[],
    data?: any,
  ) {
    // console.log('[x] action=', action);

    // const conditions = this.getConditions(resource, this.permissions);

    // console.log('[x] conditions=', conditions);

    // build permission tree
    permissions = this.filterPermissions(permissions, action);
    this.permissionTree = this.getPermissionTree(permissions);

    // console.log('[x] permissionTree=', this.permissionTree);

    // build relational tree
    let includeTree = {};

    if (include) {
      includeTree = this.getIncludeTree(include);
    } else if (data) {
      includeTree = this.getIncludeTreeFromData(data);

      console.log('[x] includeTree=', includeTree);
    }

    // build requested tree
    const requestedTree = this.getRequestedTree(resource, includeTree);

    // build the final tree
    const tree = this.getTree(
      {
        [resource.naming.camelCase]: requestedTree,
      },
      this.permissionTree,
    );

    return tree[resource.naming.camelCase];
  }

  private getIncludeTreeFromData(data: any) {
    let flag = false;

    const object = Object.keys(data).reduce((acc, key) => {
      if (isObject(data[key])) {
        acc[key] = this.getIncludeTreeFromData(data[key]);
        flag = true;
      }

      return acc;
    }, {});

    return flag ? object : true;
  }

  private getTree(
    requestedTree: NestedObject,
    permissionTree: NestedObject,
    path?: string,
  ) {
    return Object.keys(requestedTree).reduce((acc, key) => {
      if (typeof requestedTree[key] === 'boolean') {
        if (typeof permissionTree[key] === 'boolean') {
          acc[key] = requestedTree[key] && permissionTree[key];
        }
      } else {
        const newPath = `${path ? `${path}.` : ''}${key}`;

        if (!permissionTree[key]) {
          if (newPath) {
            const resource = this.getResourceByPath(newPath);

            const pTree =
              this.permissionTree[resource.naming.camelCase] || false;

            if (typeof pTree !== 'boolean') {
              acc[key] = this.getTree(
                requestedTree[key] as NestedObject,
                typeof pTree === 'boolean' ? {} : pTree,
                newPath,
              );
            }
          }

          return acc;
        }

        if (newPath) {
          const resource = this.getResourceByPath(newPath);

          const pTree = this.permissionTree[resource.naming.camelCase] || {};

          // console.log('[x] pTree', pTree);
          acc[key] = this.getTree(
            requestedTree[key] as NestedObject,
            this.mergeTwo(
              typeof permissionTree[key] === 'boolean'
                ? {}
                : (permissionTree[key] as NestedObject),
              typeof pTree === 'boolean' ? {} : pTree,
            ),
            newPath,
          );
        } else {
          acc[key] = this.getTree(
            requestedTree[key] as NestedObject,
            typeof permissionTree[key] === 'boolean'
              ? {}
              : (permissionTree[key] as NestedObject),
            newPath,
          );
        }
      }

      return acc;
    }, {});
  }

  private getResourceByPath(path: string) {
    // console.log('[x] rec path=', path);
    const parts = path.split('.');
    return parts.slice(1).reduce((acc, part) => {
      return this.schema.resources[acc.fields[part].ref.resource];
    }, this.schema.resources[parts[0]]);
  }

  private getPermissionTree(permissions: string[]) {
    return permissions.reduce((acc, permission) => {
      const p = this.parsePermission(
        permission.split(':').shift().split('.').slice(1).join('.'),
      );

      // console.log('[x] p=', p);

      acc = this.mergeTwo(acc, p);

      return acc;
    }, {});
  }

  /**
   * Transform this 'post.[title,content,author.[displayName]]' into a nested object like this
   * { post: { title: true, content: true, author: { displayName: true } } }
   */
  private parsePermission(fieldPart: string, resourceName?: string) {
    // If * then return all resources with all non-relational fields
    if (fieldPart === '*') {
      return Object.values(this.schema.resources).reduce((acc, resource) => {
        acc[resource.naming.camelCase] = Object.values(resource.fields).reduce(
          (acc, field) => {
            if (!field.ref) {
              acc[field.name] = true;
            }

            return acc;
          },
          {},
        );

        return acc;
      }, {});
    }

    // If the fieldPart is a resource name, return all fields of the resource
    // TODO: maybe need to remove
    if (this.schema.resources[fieldPart]) {
      return {
        [fieldPart]: Object.values(
          this.schema.resources[fieldPart].fields,
        ).reduce((acc, field) => {
          if (!field.ref) {
            acc[field.name] = true;
          }

          return acc;
        }, {}),
      };
    }

    const except = fieldPart[0] === '!';

    if (except) {
      fieldPart = fieldPart.slice(1);
    }

    if (fieldPart[0] === '[') {
      fieldPart = fieldPart.slice(1, -1);
    }

    let resource: Resource;
    if (resourceName) {
      resource = this.schema.resources[resourceName];
    }

    let result: NestedObject = {};

    let existingAttributes: Record<string, any>;

    if (resource) {
      existingAttributes = resource.fields;
    } else {
      existingAttributes = this.schema.resources;
    }

    if (resourceName && except) {
      result = Object.values(resource.fields).reduce((acc, field) => {
        if (!field.ref) {
          acc[field.name] = true;
        }

        return acc;
      }, {});
    }

    let i = 0;

    const addAttribute = (result: NestedObject, key: string) => {
      if (key === '*') {
        result = {
          ...result,
          ...this.getResourceTree(this.schema.resources[resourceName]),
        };
      } else if (existingAttributes[key]) {
        if (except) {
          result[key] = false;
        } else {
          if (!resourceName) {
            result[key] = this.getResourceTree(existingAttributes[key]);
          } else if (this.schema.resources[resourceName].fields[key].ref) {
            result[key] = this.getResourceTree(
              this.schema.resources[
                this.schema.resources[resourceName].fields[key].ref.resource
              ],
            );
          } else {
            result[key] = true;
          }
        }
      }

      return result;
    };

    let sequence: string = '';

    const findClosingBracket = (str: string, start: number) => {
      let bracketCount = 1;
      let j = start;

      for (; j < str.length; j++) {
        if (fieldPart[j] === ']') {
          bracketCount--;
        } else if (fieldPart[j] === '[') {
          bracketCount++;
        }

        if (bracketCount === 0) {
          break;
        }
      }

      return j;
    };

    const findEnding = (str: string, start: number) => {
      let bracketCount = 0;
      let i = start;

      for (; i < str.length; i++) {
        if (str[i] === ']') {
          bracketCount--;
        } else if (str[i] === '[') {
          bracketCount++;
        } else if (str[i] === ',' && bracketCount === 0) {
          break;
        }
      }

      return i;
    };

    // console.log('[x] fieldPart', resourceName, fieldPart);

    while (i < fieldPart.length) {
      // handle: <segment>,
      if (fieldPart[i] === ',') {
        result = addAttribute(result, sequence);
        sequence = '';
        i++;
      }
      // handle: <segment>.
      else if (fieldPart[i] === '.') {
        // handle: .!
        if (fieldPart[i + 1] === '!') {
          // handle: <segment>.![
          if (fieldPart[i + 2] === '[') {
            // let bracketCount = 1;
            const j = findClosingBracket(fieldPart, i + 3);

            result[sequence] = this.parsePermission(
              fieldPart.slice(i + 1, j + 1),
              resource ? resource.fields[sequence].ref.resource : sequence,
            );

            sequence = '';

            i = j;
          }
          // handle: .!<segment>
          else {
            const j = fieldPart.slice(i + 3).indexOf(',');

            if (j !== -1) {
              result[sequence] = this.parsePermission(
                fieldPart.slice(i + 1, j + 1),
                resource ? resource.fields[sequence].ref.resource : sequence,
              );

              i = j;
            } else {
              result = addAttribute(result, sequence);
            }

            sequence = '';
            i = fieldPart.length;
          }
        }
        // handle: <segment>.[
        else if (fieldPart[i + 1] === '[') {
          const j = findClosingBracket(fieldPart, i + 2);

          if (existingAttributes[sequence]) {
            result[sequence] = this.parsePermission(
              fieldPart.slice(i + 1, j + 1),
              resource ? resource.fields[sequence].ref.resource : sequence,
            );
          }

          sequence = '';

          i = j;
        }
        // handle: <segment>.<segment>
        else {
          const j = findEnding(fieldPart, i + 1);

          result[sequence] = this.parsePermission(
            fieldPart.slice(i + 1, j + 1),
            resource ? resource.fields[sequence].ref.resource : sequence,
          );

          sequence = '';

          i = j;
        }
      }
      // handle: <segment>
      else {
        sequence += fieldPart[i];
        i++;
      }
    }

    if (sequence) {
      result = addAttribute(result, sequence);
    }

    return result;
  }

  private getResourceTree(resource: Resource) {
    return Object.values(resource.fields).reduce((acc, field) => {
      if (!field.ref) {
        acc[field.name] = true;
      }

      return acc;
    }, {});
  }

  getConditionsFilter(
    action: BaseAction,
    resource: Resource,
    permissions: string[],
  ) {
    // console.log('[x] permissions', permissions);

    permissions = this.filterPermissions(this.permissions, action, resource);

    const conditions: string[][] = [];

    for (const permission of permissions) {
      const p = permission.split(':')[1];

      if (p) {
        conditions.push(p.split(','));
      } else {
        return;
      }
    }

    const filter: QueryFilter = { or: [] };

    for (const andConditions of conditions) {
      const and: QueryFilter = { and: [] };

      for (const condition of andConditions) {
        const [, field, value] = condition.match(/^([a-zA-Z0-9_]+)\((.*)\)$/);

        and.and.push({ field, operator: 'eq', value });
      }

      if (and.and.length > 0) {
        filter.or.push(and);
      }
    }

    return filter;
  }

  private parseConditionPart(part: string) {
    const [, field, value] = part.match(/^([a-zA-Z0-9_]+)\((.*)\)$/);
    return { field, operator: 'eq', value };
  }

  private intersection(
    obj1: NestedObject,
    obj2: NestedObject,
  ): NestedObject | null {
    const result: NestedObject = {};

    for (const key in obj1) {
      if (obj2.hasOwnProperty(key)) {
        const val1 = obj1[key];
        const val2 = obj2[key];

        // If both values are boolean
        if (typeof val1 === 'boolean' && typeof val2 === 'boolean') {
          if (val1 && val2) {
            result[key] = true;
          }
        }
        // If both values are objects, recurse
        else if (
          typeof val1 === 'object' &&
          val1 !== null &&
          typeof val2 === 'object' &&
          val2 !== null
        ) {
          const nestedIntersection = this.intersection(
            val1 as NestedObject,
            val2 as NestedObject,
          );
          if (
            nestedIntersection &&
            Object.keys(nestedIntersection).length > 0
          ) {
            result[key] = nestedIntersection;
          }
        }
        // If types mismatch or one is false, do not include the key
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  private getRequestedTree(
    resource: Resource,
    includeTree: NestedObject | boolean,
  ): NestedObject {
    if (includeTree === true) {
      includeTree = {};
    }

    return Object.values(resource.fields).reduce((acc, field) => {
      if (field.ref) {
        if (includeTree[field.name]) {
          acc[field.name] = this.getRequestedTree(
            this.schema.resources[field.ref.resource],
            includeTree[field.name],
          );
        }
      } else {
        acc[field.name] = true;
      }

      return acc;
    }, {});
  }

  private getAllowedTree(
    // requestedTree: NestedObject,
    // except: boolean,
    resource: Resource,
    parsedPermissions: RecField[],
    // attributes: RecField,
    includeTree: NestedObject,
  ): NestedObject {
    const tree: NestedObject = {};

    parsedPermissions.forEach((permission) => {
      Object.values(resource.fields).forEach((field) => {
        if (permission.except) {
          if (!permission.attributes[field.name]) {
            if (field.ref) {
              if (includeTree[field.name]) {
                const res = this.schema.resources[field.ref.resource];

                if (tree[field.name]) {
                  tree[field.name] = this.mergeTwo(
                    tree[field.name] as NestedObject,
                    this.getAllowedTreeRecursive(
                      res,
                      permission.attributes[field.name],
                      includeTree[field.name],
                    ),
                  );
                } else {
                  tree[field.name] = this.getAllowedTreeRecursive(
                    res,
                    permission.attributes[field.name],
                    includeTree[field.name],
                  );
                }
              }
            } else {
              tree[field.name] = true;
            }
          }
        } else {
          if (permission.attributes[field.name]) {
            if (field.ref) {
              if (includeTree[field.name]) {
                const res = this.schema.resources[field.ref.resource];

                if (tree[field.name]) {
                  tree[field.name] = this.mergeTwo(
                    tree[field.name] as NestedObject,
                    this.getAllowedTreeRecursive(
                      res,
                      permission.attributes[field.name],
                      includeTree[field.name],
                    ),
                  );
                } else {
                  tree[field.name] = this.getAllowedTreeRecursive(
                    res,
                    permission.attributes[field.name],
                    includeTree[field.name],
                  );
                }
              }
            } else {
              tree[field.name] = true;
            }
          }
        }
      });
    });

    return tree;
  }

  mergeTwo(a: NestedObject, b: NestedObject): NestedObject {
    const result: NestedObject = { ...a };
    for (const key in b) {
      if (b.hasOwnProperty(key)) {
        if (key in a) {
          const aVal = a[key];
          const bVal = b[key];

          if (
            typeof aVal === 'object' &&
            aVal !== null &&
            typeof bVal === 'object' &&
            bVal !== null
          ) {
            // Recursively merge nested objects
            result[key] = this.mergeTwo(
              aVal as NestedObject,
              bVal as NestedObject,
            );
          } else {
            // Overwrite with b's value if not both objects
            result[key] = bVal || aVal;
          }
        } else {
          // Add new key from b
          result[key] = b[key];
        }
      }
    }

    return result;
  }

  private getAllowedTreeRecursive(
    resource: Resource,
    permission: RecField | true,
    includeTree: NestedObject | boolean,
  ): NestedObject {
    console.log('[x] recursive=', resource.name);
    return Object.values(resource.fields).reduce((acc, field) => {
      if (permission === true) {
        acc[field.name] = true;
      } else if (permission.except) {
        if (!permission.attributes[field.name]) {
          if (field.ref) {
            if (includeTree[field.name]) {
              const res = this.schema.resources[field.ref.resource];

              acc[field.name] = this.getAllowedTreeRecursive(
                res,
                permission.attributes[field.name],
                includeTree[field.name],
              );
            }
          } else {
            acc[field.name] = true;
          }
        }
      } else {
        if (permission.attributes[field.name]) {
          if (field.ref) {
            if (includeTree[field.name]) {
              const res = this.schema.resources[field.ref.resource];

              acc[field.name] = this.getAllowedTreeRecursive(
                res,
                permission.attributes[field.name],
                includeTree[field.name],
              );
            }
          } else {
            acc[field.name] = true;
          }
        }
      }

      return acc;
    }, {});

    return;
  }

  /**
   * Build a nested object from a list of paths
   *
   * TODO: (Generate by GPT) Check for optimizations
   */
  private getIncludeTree(paths: string[]): NestedObject {
    const result: NestedObject = {};

    for (const path of paths) {
      const parts = path.split('.');
      let current: NestedObject = result;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (i === parts.length - 1) {
          // If it's the last part, set it to true
          current[part] = true;
        } else {
          // If the current part doesn't exist or is not an object, initialize it as an object
          if (!(part in current) || typeof current[part] !== 'object') {
            current[part] = {};
          }
          // Move deeper into the object
          current = current[part] as NestedObject;
        }
      }
    }

    return result;
  }

  filterPermissions(
    permissions: string[],
    action: BaseAction,
    resource?: Resource,
  ) {
    return permissions.filter((permission) => {
      const segments = permission.split('.');
      return (
        this.contains(segments[0], action) &&
        (resource
          ? this.contains(segments[1], resource.naming.camelCase)
          : true)
      );
    });
  }

  /**
   * Check if a an action or a resource is allowed by a permission segment
   */
  private contains(segment: string, item: string) {
    if (segment === '*') {
      return true;
    }

    if (segment === item) {
      return true;
    }

    const except = segment[0] === '!';

    if (except) {
      segment = segment.slice(1);
    }

    if (segment[0] === '[') {
      segment = segment.slice(1, -1);
    }

    const parts = segment.split(',');

    if (except) {
      return !parts.some((part) => part === item);
    }

    return parts.some((part) => part === item);
  }

  public parse(permission: string): RecField {
    let parts = permission.split('.');

    // const action = parts.shift();
    // const resources = parts.shift();
    parts.shift();
    parts.shift();

    if (parts.length > 0) {
      parts = parts.join('.').split('#');

      const fields = parts.shift();

      return fields === '*'
        ? { except: false, attributes: {} }
        : this.parseFields(fields);

      // return {
      //   action,
      //   resources,
      //   attributes:
      //     fields === '*'
      //       ? { except: false, attributes: {} }
      //       : this.parseFields(fields),
      // conditions,
      // };
    }

    return { except: false, attributes: {} };
  }

  private parseFields(fieldPart: string) {
    // console.log('[x] fieldPart=', fieldPart);

    let except = fieldPart[0] === '!';

    if (except) {
      fieldPart = fieldPart.slice(1);
    }

    if (fieldPart[0] === '[') {
      fieldPart = fieldPart.slice(1, -1);
    }

    let frontSequence: string = '';
    let backSequence: string = '';
    const fields: RecField = {
      except,
      attributes: {},
    };
    let i = 0;
    let j = fieldPart.length - 1;
    except = false;

    while (i < j) {
      if (fieldPart[i] === '!') {
        except = true;
        i++;
      }

      if (fieldPart[i] !== '[') {
        if (fieldPart[i] === ',') {
          fields.attributes[frontSequence] = true;
          frontSequence = '';
        } else {
          frontSequence += fieldPart[i];
        }

        i++;
      }

      if (fieldPart[j] !== ']') {
        if (fieldPart[j] === ',') {
          fields.attributes[backSequence] = true;
          backSequence = '';
        } else {
          backSequence = fieldPart[j] + backSequence;
        }

        j--;
      }

      if (fieldPart[i] === '[' && fieldPart[j] === ']') {
        fields.attributes[frontSequence.slice(0, -1)] = this.parseFields(
          (except ? '!' : '') + fieldPart.slice(i, j + 1),
        );

        frontSequence = '';

        break;
      }
    }

    if (frontSequence || backSequence) {
      if (i === j) {
        fields.attributes[frontSequence + fieldPart[i] + backSequence] = true;
      } else {
        fields.attributes[frontSequence + backSequence] = true;
      }
    }

    return fields;
  }
}

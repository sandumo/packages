import { Resource, Schema } from './types';

type BaseAction = 'read' | 'create' | 'update' | 'delete';

type RecField = {
  except?: boolean;
  attributes: {
    [key: string]: RecField | true;
  };
};

type NestedObject = {
  [key: string]: boolean | NestedObject;
};

export class PermissionParser {
  private schema: Schema;
  private permissions: string[];

  // computed
  private permissionTree: NestedObject;

  constructor(schema: Schema, permissions: string[]) {
    this.schema = schema;
    this.permissions = permissions;
  }

  tree(action: BaseAction, resource: Resource, include: string[]) {
    const permissionTree = this.getPermissionTree();

    // permissionTree = this.postprocessPermissionTree(permissionTree);

    this.permissionTree = permissionTree;
    console.log('[x] permissionTree=', permissionTree);

    // const permissions = this.filterPermissions(
    //   this.permissions,
    //   action,
    //   resource,
    // );

    // const parsedPermissions = permissions.map((permission) =>
    //   this.parse(permission),
    // );

    // console.log(
    //   '[x] parsedPermissions=',
    //   parsedPermissions, //.map((p) => p.attributes),
    // );

    const includeTree = this.getIncludeTree(include);

    const requestedTree = this.getRequestedTree(resource, includeTree);

    console.log('[x] requestedTree=', requestedTree);

    // const tr = {};

    // const tree = this.getAllowedTree(resource, parsedPermissions, includeTree);

    // const tree = this.intersection(permissionTree, {
    //   [resource.naming.camelCase]: requestedTree,
    // });

    const tree = this.getTree(
      {
        [resource.naming.camelCase]: requestedTree,
      },
      permissionTree,
    );

    console.log('[x] tree=', (tree as any).post);

    // const resourceAttributes =

    // parsedPermissions.forEach((parsedPermission) => {
    //   if (parsedPermission.attributes.except) {
    //     return Object.keys(resource.fields).forEach((field) => {
    //       if (!parsedPermission.attributes.attributes[field]) {
    //         if (tr[field]) {
    //           tr[field] = this.combine(
    //             tr[field],
    //             parsedPermission.attributes.attributes[field],
    //           );
    //         } else {
    //           tr[field] = parsedPermission.attributes.attributes[field];
    //         }
    //       }
    //     });
    //   }

    //   Object.keys(parsedPermission.attributes.attributes).forEach((field) => {
    //     if (resource.fields[field]) {
    //       tr[field] = parsedPermission.attributes.attributes[field];
    //     }
    //   });
    // });

    // return tree;
  }

  private getTree(
    requestedTree: NestedObject,
    permissionTree: NestedObject,
    path?: string,
  ) {
    // console.log('[x] path=', path, requestedTree, permissionTree);

    return Object.keys(requestedTree).reduce((acc, key) => {
      // console.log('[x] key=', key);
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
          // console.log('[x] pathe=', newPath, pTree);

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
        // acc[key] = true;
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

  private getPermissionTree() {
    const permissions = this.filterPermissions(this.permissions, 'read');

    // const permissionTree: NestedObject = {};

    const permissionTree = permissions.reduce((acc, permission) => {
      const p = this.parsePermission(permission.split('.').slice(1).join('.'));

      acc = this.mergeTwo(acc, p);

      // const p = this.parsePermission(permission.split('.').slice(1).join('.'));

      // console.log('[x] permission=', p);
      return acc;
    }, {});

    // console.log('[x] permissionTree1=', permissionTree);

    return permissionTree;
  }

  /**
   * Transform this 'post.[title,content,author.[displayName]]' into a nested object like this
   * { post: { title: true, content: true, author: { displayName: true } } }
   */
  private parsePermission(fieldPart: string, resourceName?: string) {
    // console.log('[x] fieldPart=', fieldPart, resourceName);

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

    let result: NestedObject = {};

    let existingAttributes: Record<string, any>;

    if (resourceName) {
      existingAttributes = this.schema.resources[resourceName].fields;
    } else {
      existingAttributes = this.schema.resources;
    }

    if (resourceName && except) {
      result = Object.keys(this.schema.resources[resourceName].fields).reduce(
        (acc, field) => ({
          ...acc,
          [field]: true,
        }),
        {},
      );
    }

    let frontSequence: string = '';
    let backSequence: string = '';
    let i = 0;
    let j = fieldPart.length - 1;

    // console.log('[x] fieldPart=', fieldPart, resourceName);

    const addAttribute = (result: NestedObject, key: string) => {
      // console.log('[x] foo=', key);
      if (key === '*') {
        // console.log('[x] gothere=', key);
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

    while (i < j) {
      // frontSequence
      if (fieldPart[i] !== '[') {
        if (fieldPart[i] === ',') {
          result = addAttribute(result, frontSequence);
          frontSequence = '';
        } else {
          frontSequence += fieldPart[i];
        }

        i++;
      }

      // backSequence
      if (fieldPart[j] !== ']') {
        if (fieldPart[j] === ',') {
          result = addAttribute(result, backSequence);
          backSequence = '';
        } else {
          backSequence = fieldPart[j] + backSequence;
        }

        j--;
      }

      // nested object
      if (
        (fieldPart[i] === '[' || fieldPart[i] === '!') &&
        fieldPart[j] === ']'
      ) {
        frontSequence = frontSequence.slice(0, -1);

        if (existingAttributes[frontSequence]) {
          if (resourceName) {
            const resource =
              this.schema.resources[resourceName].fields[frontSequence].ref
                .resource;

            result[frontSequence] = this.parsePermission(
              fieldPart.slice(i, j + 1),
              resource,
            );
          } else {
            result[frontSequence] = this.parsePermission(
              fieldPart.slice(i, j + 1),
              frontSequence,
            );
          }
        }

        frontSequence = '';

        break;
      }
    }

    if (frontSequence || backSequence) {
      const keys = [];

      if (i === j) {
        if (fieldPart[i] === ',') {
          keys.push(frontSequence);
          keys.push(backSequence);
        } else {
          keys.push(frontSequence + fieldPart[i] + backSequence);
        }
      } else {
        keys.push(frontSequence + backSequence);
      }

      keys.forEach((key) => {
        result = addAttribute(result, key);
      });
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

  // private postprocessPermissionTree(
  //   tree: NestedObject | boolean,
  //   resourceName?: string,
  // ) {
  //   if (tree === true) {
  //     return true;
  //   }

  //   // console.log('[x] resource=', resource.naming.camelCase);

  //   return Object.keys(tree).reduce((acc, key) => {
  //     console.log('[x] key=', key);

  //     if (!resourceName) {
  //       acc[key] = this.postprocessPermissionTree(tree[key], key);
  //     } else {
  //       const resource = this.schema.resources[resourceName];
  //       if (resource.fields[key].ref) {
  //         acc[key] = this.postprocessPermissionTree(
  //           tree[key],
  //           resource.fields[key].ref.resource,
  //         );
  //       } else {
  //         acc[key] = tree[key];
  //       }
  //     }

  //     return acc;
  //   }, {});
  // }

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

  private mergeTwo(a: NestedObject, b: NestedObject): NestedObject {
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
            result[key] = bVal;
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

  private filterPermissions(
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

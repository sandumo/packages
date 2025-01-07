import { NestedObject } from './permissions';

export class Tree {
  static merge(a: NestedObject, b: NestedObject): NestedObject {
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
            result[key] = this.merge(
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

  /**
   * Filter the data based on the tree (recursive)
   */
  static filter(data: any, tree: NestedObject) {
    return Object.keys(tree).reduce((acc, key) => {
      if (tree[key] === true) {
        acc[key] = data[key];
      } else if (typeof tree[key] === 'object') {
        if (Array.isArray(data[key])) {
          acc[key] = data[key].map((item) =>
            this.filter(item, tree[key] as NestedObject),
          );
        } else {
          acc[key] = this.filter(data[key], tree[key] as NestedObject);
        }
      }
      return acc;
    }, {});
  }

  /**
   * Intersect two trees (recursive)
   */
  static intersect(a: NestedObject, b: NestedObject): NestedObject {
    return Object.keys(a).reduce((acc, key) => {
      if (a[key] === true && b && b[key] === true) {
        acc[key] = true;
      } else if (typeof a[key] === 'object') {
        acc[key] = this.intersect(
          a[key] as NestedObject,
          b[key] as NestedObject,
        );
      }

      return acc;
    }, {});
  }
}

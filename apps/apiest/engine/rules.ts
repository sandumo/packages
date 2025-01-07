import { Permission, QueryFilter, Resource } from './types';

export const rules = {
  root: ['*.*'], // root user
  admin: ['*.post'], // not sure if needed
  owner: ['*.post'], // owner of the resource
  user: ['read.post.![status].status(published)'], // authenticated user
  guest: ['read.post.![status].status(published)'], // unauthenticated user
  anyone: ['read.post.![status].status(published)'],
};

export function parsePermission(permission: string) {
  return {
    actions: [],
    excludeActions: false,
    resources: [],
    excludeResources: false,
    fields: [],
    excludeFields: false,
    conditions: [],
    excludeConditions: false,
    specials: [],
  };

  const match = permission.match(
    /^(\!)?\[?([a-z\*,]+)\]?\.(\!)?\[?([_a-zA-Z0-9\*,]+)\]?(\.(\!)?\[?([_a-zA-Z0-9\*,]+)\]?(\.?(\!)?\[?([^\]]+)\]?)?)?$/,
  );

  const actions = match[2]?.split(',');
  const resources = match[4]?.split(',');
  const fields = match[7]?.split(',') || ['*'];
  let conditions = match[10]?.split(',') || [];
  const specials = conditions.filter((condition) => condition[0] === '$');
  conditions = conditions.filter((condition) => condition[0] !== '$');

  return {
    actions,
    excludeActions: match[1] === '!',
    resources,
    excludeResources: match[3] === '!',
    fields,
    excludeFields: match[6] === '!',
    conditions,
    excludeConditions: match[9] === '!',
    specials,
  };
}

export function combinePermissions(
  permissions: Permission[],
  resource: Resource,
  action: 'read' | 'write' | 'delete' | 'manage',
): [string[], QueryFilter] {
  permissions = filterPermissions(permissions, action, resource);

  const attributes = getAllowedAttributes(resource, permissions, action);

  let conditions = [];

  permissions.some((permission) => {
    if (permission.excludeConditions === false) {
      if (permission.conditions[0] === '*') {
        conditions.push('*');
      } else {
        conditions.push(permission.conditions);
      }
    } else {
      conditions.push(permission.conditions);
    }
  });

  if (conditions.includes('*')) {
    conditions = ['*'];
  }
  // else {
  //   conditions = conditions.filter(
  //     (condition, index, self) => self.indexOf(condition) === index,
  //   );
  // }

  // console.log('[x] ultimate conditions', conditions);
  const filter: QueryFilter = { or: [] };

  if (conditions[0] !== '*') {
    for (const andConditions of conditions) {
      const and: QueryFilter = { and: [] };

      for (const condition of andConditions) {
        const [, field, value] = condition.match(/^([a-zA-Z0-9_]+)\((.*)\)$/);

        // console.log('[x] match', match);
        and.and.push({ field, operator: 'eq', value });
      }

      if (and.and.length > 0) {
        filter.or.push(and);
      }
    }
  }

  // console.log('[x] ultimate filter', filter);

  return [attributes, filter.or.length > 0 ? filter : null];
}

export function filterPermissions(
  permissions: Permission[],
  action: 'read' | 'write' | 'delete' | 'manage',
  resource: Resource,
  // attributes?: string | string[],
) {
  return permissions.filter((permission) => {
    if (
      ((permission.excludeActions === false &&
        permission.actions.some((_action) =>
          ['*', 'manage', action].includes(_action),
        )) ||
        (permission.excludeActions === true &&
          !permission.actions.some((_action) =>
            ['*', 'manage', action].includes(_action),
          ))) &&
      ((permission.excludeResources === false &&
        permission.resources.some((_resource) =>
          ['*', resource.naming.camelCase].includes(_resource),
        )) ||
        (permission.excludeResources === true &&
          !permission.resources.some((_resource) =>
            ['*', resource.naming.camelCase].includes(_resource),
          )))
    ) {
      return permission;
    }
  });
}

export function getPrismaMask(resource: Resource, permissions: Permission[]) {
  permissions = filterPermissions(permissions, 'read', resource);

  let fields = [];

  permissions.some((permission) => {
    if (permission.excludeFields === false) {
      if (permission.fields[0] === '*') {
        fields.push('*');

        return true;
      } else {
        fields.push(...permission.fields);
      }
    } else {
      fields.push(
        ...Object.keys(resource.fields).filter(
          (field) => !permission.fields.includes(field),
        ),
      );
    }
  });

  if (fields.includes('*')) {
    fields = ['*'];
  } else {
    // unique fields
    fields = fields.filter(
      (field, index, self) => self.indexOf(field) === index,
    );
  }

  return fields;
}

/**
 * Get the allowed attributes for the given action
 *
 * TODO: take into account different permissions with different identifiables
 *
 * @param resource
 * @param permissions
 * @param action
 * @returns
 */
export function getAllowedAttributes(
  resource: Resource,
  permissions: Permission[],
  action: 'read' | 'write' | 'delete' | 'manage',
) {
  permissions = filterPermissions(permissions, action, resource);

  let attributes = [];

  permissions.some((permission) => {
    if (permission.excludeFields === false) {
      if (permission.fields[0] === '*') {
        attributes.push('*');

        // return true;
      } else {
        attributes.push(...permission.fields);
      }
    } else {
      attributes.push(
        ...Object.keys(resource.fields).filter(
          (field) => !permission.fields.includes(field),
        ),
      );
    }
  });

  if (attributes.includes('*')) {
    if (action === 'write' && !attributes.includes(resource.primaryKey)) {
      attributes = Object.values(resource.fields)
        .filter((field) => field.primaryKey)
        .map((field) => field.name);
    } else {
      attributes = Object.values(resource.fields).map((field) => field.name);
    }
  } else {
    // unique fields
    attributes = attributes.filter(
      (field, index, self) => self.indexOf(field) === index,
    );
  }

  return attributes;
}

import { getAllowedAttributes } from './rules';
import { schema } from './schema';
import {
  FieldType,
  Field,
  Resource,
  QueryFilter,
  Permission,
  Schema,
} from './types';
import { z } from 'zod';

// export function cast(value: any, type: 'integer'): number;
// export function cast(value: any, type: 'float'): number;
// export function cast(value: any, type: 'boolean'): boolean;
// export function cast(value: any, type: 'string'): string;

/**
 * Cast value to the given type
 * @param value - The value to cast
 * @param type - The type to cast the value to
 * @returns The casted value
 */
export function cast(value: any, type: FieldType): number | boolean | string {
  if (type === 'integer') {
    return parseInt(value);
  } else if (type === 'float') {
    return parseFloat(value);
  } else if (type === 'boolean') {
    if (value === 'false') {
      return false;
    }

    return typeof value === 'boolean' ? value : Boolean(value);
  } else {
    return value;
  }
}

export function castable(value: any, type: FieldType) {
  if (type === 'integer') {
    return !isNaN(parseInt(value));
  } else if (type === 'float') {
    return !isNaN(parseFloat(value));
  } else if (type === 'boolean') {
    return typeof value === 'boolean'
      ? value
      : value === 'true' || Boolean(value);
  } else {
    return value;
  }
}

/**
 * Cast filter base on the given model
 * @param filter - The filter to cast
 * @param model - The model to cast the filter to
 * @returns The casted filter
 */
export function castFilter(filter: QueryFilter, model: Resource) {
  if (!filter) {
    return {};
  }

  if ('or' in filter) {
    return {
      or: filter.or.map((f) => castFilter(f, model)),
    };
  }

  if ('and' in filter) {
    return {
      and: filter.and.map((f) => castFilter(f, model)),
    };
  }

  return {
    ...filter,
    value: cast(filter.value, model.fields[filter.field].type),
  };
}

/**
 * Transform filter to prisma filter
 * @param filter - The filter to transform
 * @returns The transformed filter
 */
export function transformToPrismaFilter(filter: QueryFilter) {
  if (!filter) {
    return {};
  }

  if ('or' in filter) {
    return {
      OR: filter.or.map((f) => transformToPrismaFilter(f)).filter(Boolean),
    };
  }

  if ('and' in filter) {
    return {
      AND: filter.and.map((f) => transformToPrismaFilter(f)).filter(Boolean),
    };
  }

  if (filter.operator === 'eq') {
    return { [filter.field]: filter.value };
  }

  if (!filter.operator) {
    return {};
  }

  return null;
}

export function castData(model: Resource, data: any) {
  const result = {};

  Object.entries(model.fields).forEach(([key, field]) => {
    if (data[key] === undefined) {
      return;
    }

    if (field.iterable) {
      result[key] = data[key].map((value: any) => castValue(value, field.type));
    } else {
      result[key] = castValue(data[key], field.type);
    }
  });

  return result;
}

export function castValue(value: any, type: FieldType) {
  if (type === 'integer') {
    return parseInt(value);
  } else if (type === 'float') {
    return parseFloat(value);
  } else if (type === 'boolean') {
    return typeof value === 'boolean' ? value : value === 'true';
  }

  return value;
}

export function validateData(
  model: Resource,
  data: any,
  optional: boolean = false,
) {
  const schema = z.object(
    Object.fromEntries(
      Object.entries(model.fields).map(([key, field]) => {
        let zod: z.ZodTypeAny;

        if (field.iterable) {
          zod = z.array(validateValue(field, field.type));
        } else {
          zod = validateValue(field, field.type);
        }

        if (
          optional ||
          field.nullable ||
          field.primaryKey ||
          field.defaultValue !== undefined ||
          field.iterable
        ) {
          zod = zod.optional();
        }

        return [key, zod];
      }),
    ) as Record<string, z.ZodTypeAny>,
  );

  return schema.safeParse(data);
}

export function validateValue(field: Field, type: FieldType): z.ZodTypeAny {
  let zod: z.ZodTypeAny;

  if (type === 'integer') {
    zod = z.number();
  } else if (type === 'float') {
    zod = z.number();
  } else if (type === 'boolean') {
    zod = z.boolean();
  } else if (type === 'file') {
    zod = z.any();
  } else {
    zod = z.string();
  }

  // if (
  //   field.nullable ||
  //   field.primaryKey ||
  //   field.defaultValue !== undefined ||
  //   field.iterable
  // ) {
  //   zod = zod.optional();
  // }

  return zod;
}

export function traverse(
  data: any,
  model: Resource,
  callback: (
    key: string,
    value: any,
    field: Field,
    model: Resource,
    schema: Schema,
  ) => void,
) {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, value]) =>
        model.fields[key]
          ? [key, callback(key, value, model.fields[key], model, schema)]
          : [key, undefined],
      )
      .filter(([, value]) => value !== undefined),
  );
}

export function getIdentificationFilter(
  resource: Resource,
  identificationString: string,
  permissions: Permission[],
) {
  if (permissions.length === 0) {
    return null;
  }

  const allowedAttributes = [];

  permissions.map((permission) =>
    permission.specials.map((special) => {
      if (special.startsWith('$id')) {
        allowedAttributes.push(special.split('(')[1].replace(')', ''));
      }
    }),
  );

  const identificator = identificationString;

  const identifiableFields = Object.keys(resource.fields).filter(
    (field) =>
      resource.fields[field].identifiable &&
      (allowedAttributes.length === 0 || allowedAttributes.includes(field)),
  );

  let [field, value] = identificator.split(':');

  if (!value) {
    value = field;
    field = null;
  }

  if (field && !identifiableFields.includes(field)) {
    return null;
  }

  let filter;

  if (field) {
    filter = {
      [field]: cast(value, resource.fields[field].type),
    };
  } else if (identifiableFields.length === 1) {
    filter = {
      [identifiableFields[0]]: cast(
        value,
        resource.fields[identifiableFields[0]].type,
      ),
    };
  } else if (identifiableFields.length > 1) {
    filter = identifiableFields.reduce(
      (acc, field) => ({
        ...acc,
        ...(castable(value, resource.fields[field].type) && {
          [field]: cast(value, resource.fields[field].type),
        }),
      }),
      {},
    );
  }

  if (Object.keys(filter).length === 0) {
    return null;
  }

  let identificationFilter: QueryFilter;

  if (Object.keys(filter).length > 1) {
    const tempFilter: QueryFilter = { or: [] };

    Object.keys(filter).map((field) => {
      tempFilter.or.push({
        field,
        operator: 'eq',
        value: filter[field],
      });
    });

    identificationFilter = tempFilter;
  } else {
    Object.keys(filter).map((field) => {
      identificationFilter = {
        field,
        operator: 'eq',
        value: filter[field],
      };
    });
  }

  return identificationFilter;
}

export function cleanData(
  resource: Resource,
  data: any,
  permissions: Permission[],
) {
  const allowedAttributes = getAllowedAttributes(
    resource,
    permissions,
    'write',
  );

  return traverse(data, resource, (key, value) => {
    if (allowedAttributes.includes(key)) {
      return value;
    }
  });
}

export function camelCaseToKebabCase(value: string) {
  return value.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// NOT USED YET
export async function asyncReduce<T, U>(
  array: T[],
  reducer: (
    accumulator: U,
    currentValue: T,
    index: number,
    array: T[],
  ) => Promise<U>,
  initialValue: U,
): Promise<U> {
  let accumulator = initialValue;

  for (let i = 0; i < array.length; i++) {
    accumulator = await reducer(accumulator, array[i], i, array); // Await each step
  }

  return accumulator;
}

// NOT USED YET
export async function asyncReduceParallel<T, U>(
  array: T[],
  reducer: (
    accumulator: U,
    currentValue: T,
    index: number,
    array: T[],
  ) => Promise<U>,
  initialValue: U,
  combiner: (accumulator: U, currentResult: U) => U,
): Promise<U> {
  // Run all async operations in parallel
  const results = await Promise.all(
    array.map(async (currentValue, index) => {
      return reducer(initialValue, currentValue, index, array);
    }),
  );

  // Combine the results using the provided combiner function
  return results.reduce(combiner, initialValue);
}

export async function asyncMapParallel<T, U>(
  array: T[],
  mapper: (item: T, index: number, array: T[]) => Promise<U>,
): Promise<U[]> {
  // Run all async operations in parallel
  return Promise.all(array.map(mapper));
}

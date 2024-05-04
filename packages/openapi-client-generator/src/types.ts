export type SpecMethod = {
  operationId: string;
  parameters: SpecMethodParameter[];
  responses: {
    '200': SpecMethodResponse;
    default: SpecMethodResponse;
  };
  requestBody?: {
    content: {
      'application/json': {
        schema: {
          type: 'array';
          items: {
            '$ref': string;
          };
          '$ref': undefined;
        } | {
          type: undefined;
          items: undefined;
          '$ref': string;
        };
      };

      'multipart/form-data': {
        schema: {
          type: 'array';
          items: {
            '$ref': string;
          };
          '$ref': undefined;
        } | {
          type: undefined;
          items: undefined;
          '$ref': string;
        };
      };
    };
  };
  tags: string[];
}

export type SpecMethodResponse = {
  description: string;
  content?: {
    'application/json': {
      schema: {
        type: 'array';
        items: {
          type?: string;
          '$ref'?: string;
        };
        '$ref': undefined;
      } | {
        type: undefined;
        items: undefined;
        '$ref': string;
      };
    };
  };
}

export type SpecMethodParameter = {
  name: string;
  required: boolean;
  in: 'query' | 'path' | 'body';
  schema: {
    type: 'string';
    '$ref': undefined;
  } | {
    type: 'number';
    '$ref': undefined;
  } | {
    type: 'boolean';
    '$ref': undefined;
  } | {
    type: 'array';
    items: {
      type: 'string';
      '$ref': undefined;
    } | {
      type: 'number';
      '$ref': undefined;
    } | {
      type: 'boolean';
      '$ref': undefined;
    } | {
      type: 'object';
      '$ref': undefined;
    } | {
      type: undefined;
      '$ref': string;
    };
    '$ref': undefined;
  } | {
    type: 'object';
    '$ref': undefined;
  } | {
    type: undefined;
    '$ref': string;
  };
}

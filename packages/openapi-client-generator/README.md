# @sandumo/openapi-client-generator

This package generates a client for an OpenAPI specification.

## Installation

```bash
npm install @sandumo/openapi-client-generator
```

## Usage

### Generating client code

```typescript
import { OpenAPIClientGenerator } from '@sandumo/openapi-client-generator';

const schema = JSON.parse(fs.readFileSync('path/to/openapi-schema.json', 'utf8'));
const outputFile = 'path/to/output/file.ts';

new OpenAPIClientGenerator()
  .fromSchema(schema)
  .toPath(outputFile)
  .generate();
```

### Using the generated client

```typescript
import api from './path/to/output/file';

api.axios.defaults.baseURL = 'https://api.example.com'; // api.axios is an Axios instance

await api.users.getUsers();
```

#### react-query

```typescript
import api from './path/to/output/file';

export function ContextSettings() {
  // Set the queryClient for the api-client
  const queryClient = useQueryClient();

  useEffect(() => {
    api.config.queryClient = queryClient;
  }, [queryClient]);

  return <></>;
}

export function Component() {
  const { data: users } = useQuery(api.users.getUsersQuery());

  return <></>
}
```

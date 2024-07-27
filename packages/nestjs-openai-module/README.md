# @sandumo/nestjs-openai-module

This package provides a NestJS module for interacting with OpenAI.

## Installation

```bash
npm install @sandumo/nestjs-openai-module
```

## Usage

```typescript
import { OpenAIModule } from '@sandumo/nestjs-openai-module';

@Module({
  imports: [OpenAIModule.forRoot({ apiKey: 'your-api-key' })]
})
```

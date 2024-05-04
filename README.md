# JobSpace

The next gen job finder platform..

## Table of Contents
- [Get started](#get-started)
- [Installation](#installation)
- [Development](#development)
- [Useful commands](#useful-commands)
  - [How to install a new package?](#how-to-install-a-new-package)
  - [How to create a new migration file?](#how-to-create-a-new-migration-file)
  - [How to run migrations?](#how-to-run-migrations)
  - [How to create new nestjs module?](#how-to-create-new-nestjs-module)
- [Workflow](#workflow)
- [Repo Overview](#repo-overview)
- [Useful Links](#useful-links)

## Get started

This is a monorepo. It uses [Turborepo](https://turborepo.org/) to manage all the packages and apps.

The backend is a [Nest.js](https://nestjs.com/) app. It uses [TypeORM](https://typeorm.io/) as ORM and [MySQL](https://www.mysql.com/) as database.

The frontend is a [Next.js](https://nextjs.org/) app. It uses [Material UI](https://material-ui.com/) as UI framework.

#### Usefull links to get started:
- [What is a monorepo](https://turbo.build/repo/docs/handbook/what-is-a-monorepo)
- [What is Next.js](https://nextjs.org/docs)
- [What is Nest.js](https://docs.nestjs.com/)

## Installation

Clone the repo on you local machine

```sh
git https://github.com/sandumorari/job-space job-space
```

Move inside the project root dir

```sh
cd job-space
```

Install the `pnpm` package manager

```sh
npm install --global pnpm
```

Install all dependencies for all apps and packages

```sh
pnpm install
```

## Development

Create `.env` files from `.env.example` for each app individually and config them with appropriately

```sh
cp apps/web/.env.example apps/web/.env
```

```sh
cp apps/api/.env.example apps/api/.env
```

Make sure you mysql server is running and has the required database

To start the apps in development mode run the following command:

```sh
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app running.

## Useful Commands

### How to install a new package?

To install a new package use following command:

```sh
pnpm install <package-name>@<tag> --filter <app-or-package-name>
```

- `<package-name>` is the name of the package that you want to install.
- `<tag>` is the package version. If you don't specify it them tag `latest` will be used.
- `<app-or-package-name>` the app name or package name. For example if we want to install a package in `web` app then we will use the filter like this: `--filter web`. If we need to install a package in the local package `ui` the we'll use it like this: `--filter ui`.

The same way you can remove a package:
```sh
pnpm rm <package-name> --filter <app-or-package-name>
```

### How to create a new migration file?

Move into the `apps/api` dir and run this:

```sh
pnpm run migration:create <migration-name>
```

Where `<migration-name>` is the name of your migration. Try to give a descriptive name.

A new file will be created inside `apps/api/src/database/migrations/`. Open it and change the tab size to 2 spaces and add your query. After that you're free to run your migration.

### How to run migrations?

Move into the `apps/api` dir and run this:

```sh
pnpm run migrate
```

### How to create new nestjs module?

There is nest cli to do this. [Nest CLI](https://docs.nestjs.com/cli/overview) and [Generate Options](https://docs.nestjs.com/cli/usages#nest-generate)

First of all move to `apps/api` dir. And then use this command:

```sh
nest g mo app/<module-name>
```
- `g` is an alias for `generate`
- `mo` is an alias for `module`
- `<module-name>` will the new module name

If we want to run the command without shorthand aliases then it will look like this:

```sh
nest generate module app/<module-name>
```

Lets generate a new example module with all type of files:

Create the module:

```sh
nest generate module app/example
```

Create the controller:

```sh
nest generate controller app/example
```

Create the service:

```sh
nest generate service app/example
```

`next generate` will also automatically import your module in the global `src/app.module.ts`.

Other files like `example.types.ts`, `example.dto.ts` and `example.entity` you will need to create yourself.

## Workflow

This repo complies with [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

There are two environments:
- `develop` - development branch ([Check the deployment](http://62.171.153.133/))
- `main` - production branch

All the work will be done in the following way:
- You have a task to work on. It can be a new feature, a bugfix or something else.
- You need to create a new branch from `develop` where you will be working on the task. Try to give it a descriptive name (no spaces, use dash`-`).
- Once you've done your work on your branch you can commit it and push it.
- Now go on GitHub and create a new PR (pull request) from your branch into `develop` branch.
- Attach reviewers on the PR. Wait their approves and after that merge your PR into `develop`.

And that's it.

## Repo Overview

- `apps`
  - `api`-  a [Nest.js](https://nestjs.com/) app
    - `src` - source code dir
      - `app` -  all application modules are here
        - `example` - an example module
          - `example.module.ts` - here are listed all module dependencies and exports
          - `example.controller.ts` - here are defined all routes for this module
          - `example.service.ts` - here goes our business logic, database manipulation and others
          - `example.entity.ts` - here is our database model. (Actually in `typeorm` it's not really a model, that's why it's called `entity`. But it's very similar to a model)
          - `example.types.ts` - here we describe our `ts` types for this module.
          - `example.dto.ts` - here goes types enhanced with validation rules that will be used to validate request data.
          - `example.<type>.spec.ts` - files with `spec` in their name are for unit tests.
      - `config` - all config are here, including env variable parsing
      - `database`
        - `migrations` - app migration files
  - `web` - a [Next.js](https://nextjs.org) app
    - `src`
      - `components` - all custom components, each component should be reusable and should not include bussiness logic
      - `icons` - custom icons beside MUI icons
      - `layouts` - all custom layouts like EmployerLayout, EmployeeLayout, etc.
      - `pages` - here are all our nextjs pages.
        - `_app.tsx` - nextjs configurations for all pages
        - `_document.tsx` - nextjs configrations for all pages
        - `example.tsx` - an example page
      - `views` - kind of components that don't have to be reusable and can include business logic.
- `packages`
  - `api-client` - all api requests are here
    - `src`
      - `core` - here are some api utilities + config
      - `modules` - here are all api requests divided by modules
        - `example` - example module
          - `example.ts` - api requests
          - `example.types.ts` - types for api requests
          - `index.ts` - exports
        - `index.ts` - exports each api module
  - `datetime` - date and time utils (a wrapper around dayjs)
  - `utils` - some utilities
    - `src`
      - `index.ts` - utilities
      - `types.ts` - global types. Can be used in `web` as well as in `api`. (When will have time will move it to a separate package)
  - `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
  - `tsconfig`: `tsconfig.json`s used throughout the monorepo
  - `ui` (NOT IN USE!): a stub React component library shared by both `web` and `docs` applications
    - `components` - here are all our customer ui components
    - `fonts` - here are defined app fonts. Already configured so no need to change anything here. (used font: Roboto)
    - `layouts` - here we define ui layouts
    - `themes` - here we define our themes

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/core-concepts/pipelines)
- [Caching](https://turborepo.org/docs/core-concepts/caching)
- [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/core-concepts/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)



---

## ZOD form validation

[Link to the github](https://github.com/colinhacks/zod/blob/master/README.md)

[Link to the npmjs](https://www.npmjs.com/package/zod)


First think is necesary to install the library 

```bash
npm i zod
```

After that we can import the library in our component file and start using it

```ts
import { z } from 'zod';
import { ZodIssue } from 'zod';
```

Inside component we need to declare the schema for the form we want to validate 

```ts
const schema = z.object({
  position: z.string().min(1),
  organization: z.string().min(2),
  startDate: z.date(),
  endDate: z.date(),
  salary: z.string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: 'Invalid salary. Please enter a valid numeric value.',
    })
    .transform((value) => parseFloat(value)),
  salaryCurrencyName: z.string(),
  location: z.string(),
});
```

In the dialog we will use this library like that:

```ts

      <Dialog
        title="Adaugă experiență"
        width={550}
        
        ...

        isForm
        onSubmit={handleSubmit}
        getFormValidationErrors={data => {
          const validationResult = schema.safeParse(data);

          if (validationResult.success) {
            return {};
          } else {
            const indexedErrors = transformToIndexedErrors(validationResult.error.errors);
            return indexedErrors;

          }

        }}
      >
        {({ errors }) => (
          <>

          ...

          //here goes code from modal 
           <TextField 
              name="salary" 
              error={!!errors.salary} 
              helperText={errors.salary} 
              label="Salariu" 
              size="small" 
              fullWidth 
           />

           ....


          </>
        )}
      </Dialog>
```

All the validations happens inside the parameter of the dialog getFormValidationErrors
wich recieve data paramaters all the data from the form and based on the schema declared previously we parse the content 


```ts
  const validationResult = schema.safeParse(data);
```


based on the errors we recieved from safe parse wee nedd to transfer back an object for succes case it is empty object and for error case object with errors which are used in form when dates are wrong for show in form.

error parameter is boolean which indicate if are some errors now, helperText indicate the text which will be displayed for the user


```ts           
<TextField 
  name="salary" 
  error={!!errors.salary} 
  helperText={errors.salary} 
...
/>

```

For a real exemple please look in files like 

- UserStateCard.tsx
- UserViewLeft.tsx
- UserExperienceCard.tsx
- Etc.


Here are the small exemple on how it works in a simple script without component:
```ts
import * as z from 'zod';

const schema = z.object({
  position: z.string().min(1),
  organization: z.string().min(2),
  startDate: z.date(),
  endDate: z.date(),
  salary: z.string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: 'Invalid salary. Please enter a valid numeric value.',
    })
    .transform((value) => parseFloat(value)),
  salaryCurrencyName: z.string(),
  location: z.string(),
});

// Example usage
const data = {
  position: 'Software Engineer',
  organization: 'Example Company',
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-12-31'),
  salary: '5000',
  salaryCurrencyName: 'USD',
  location: 'New York',
};

const validationResult = schema.safeParse(data);

if (validationResult.success) {
  console.log('Valid data:', validationResult.data);
} else {
  console.log('Invalid data:', validationResult.error.message);
}
```

---

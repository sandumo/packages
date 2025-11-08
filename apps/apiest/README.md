# Apeist

Fastest way to create a REST API with Node.js

## Table of contents

- [How it works](#how-it-works)
- [Features](#features)
- [TODO](#todo)
- [System](#system)
- [Security Rules](#security-rules)

## How it works

1. List Request is received
2. Tree is built based on requested resource, include and permissions
3. Build filter based on requested resource, query filters, conditions and permissions
  - filter merging, checking
  { field: 'author.role.name', operator: 'eq', value: 'publisher' }


post: {
  select: {
    id: true,
    title: true,
    content: true,
    owner: {
      select: {
        id: true,
        displayName: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  },

}









## Features

- Workflow automations (triggers on some actions and perform some other actions)

ownables can be requested like this:
users/:id/posts


## TODO

- Realtime database functinality
- Notification system
- Caching layer


### System

- Helmet
- Rate limiting

### Security Rules

// TODO
// It would make sense that a permission dissallow something, a field for example.
// I might look like 'read.post.?title'. This permission would dissallow reading the title field of the post.
// Or it can be like this '!read.post.title'. Leading '!' meaning dissallow.
// Example with condition: '!read.post.[id,title]:status(draft)'

Structure:

action.resource.attribute

Examples:

```ts
'read.post.title'
'read.post.[title,content]'
'write.post.title'
'create.post'
'update.post.status'
'delete.post'
'read.post.[author.[displayName]]'
'read.[post,comment]'

'list.post'
'read.post'
'create.post'
'update.post'
'delete.post'
'read.post.[id,title,content,author.[id,displayName],comments.[id,content]]:status(published)'
```

- Permissions
- Realtime database


read
  post
    title
    content
    author
      email
      displayName
      role
        id
        name
    comments
      content


read permissions must be the most optimal


resource, include

[base-resource]/[id]/[relation-resource]

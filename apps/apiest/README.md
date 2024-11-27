# Apeist

Fastest way to create a REST API with Node.js

## Table of contents

- [TODO](#todo)
<!-- - [Features](#features) -->
- [System](#system)

- [Security Rules](#security-rules)

## TODO

- Realtime database functinality
- Notification system
- Caching layer


### System

- Helmet
- Rate limiting

### Security Rules


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

# API Reference

Clean, developer-facing reference for the Toko Kita Express API.

---

## 🚦 Base URL

Use the local server during development.

- `http://localhost:3000`

---

## 🔐 Authentication

JWT-only auth with access + refresh tokens.

- Default: httpOnly cookies (`access_token`, `refresh_token`)
- Fallback: `Authorization: Bearer <accessToken>`
- Access tokens are returned on login/refresh responses
- Refresh tokens rotate on every `/api/auth/refresh`

---

## ⚙️ Response format

Errors return a consistent shape.

```json
{
  "error": {
    "message": "string",
    "code": "string"
  }
}
```

---

## ✅ Auth endpoints

Short overview of auth-related endpoints.

| Method | Path | What | When | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Register user | First-time signup | Creates user + session |
| POST | `/api/auth/login` | Login user | Sign-in flow | Issues tokens |
| POST | `/api/auth/refresh` | Refresh session | Token renewal | Rotates refresh token |
| POST | `/api/auth/logout` | Logout user | End session | Clears cookies |
| GET | `/api/auth/me` | Current user | On page load | Requires auth |

### POST /api/auth/register

Create a new user and start a session.

Request:

```json
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "password123",
  "fullName": "Demo User",
  "avatarUrl": "https://example.com/avatar.png",
  "bio": "Short bio"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "uid": "uuid",
    "username": "demo",
    "email": "demo@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt"
}
```

### POST /api/auth/login

Start a session using email and password.

Request:

```json
{
  "email": "admin@example.com",
  "password": "admin12345"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "uid": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt"
}
```

### POST /api/auth/refresh

Rotate refresh token and issue a new access token.

Notes:
- Uses httpOnly cookies by default
- Bearer fallback allowed

Response:

```json
{
  "user": {
    "id": "uuid",
    "uid": "uuid",
    "username": "demo",
    "email": "demo@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt"
}
```

### POST /api/auth/logout

Invalidate refresh token and clear cookies.

Response:

```json
{
  "success": true
}
```

### GET /api/auth/me

Return the current authenticated user.

Response:

```json
{
  "user": {
    "id": "uuid",
    "uid": "uuid",
    "username": "demo",
    "email": "demo@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 👥 User endpoints

All endpoints require authentication.

| Method | Path | What | When | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/users` | List users | Admin dashboards | Admin only |
| GET | `/api/users/:id` | Get user | Profile views | Self or admin |
| POST | `/api/users` | Create user | Admin tooling | Admin only |
| PUT | `/api/users/:id` | Update user | Profile edits | Self or admin |
| DELETE | `/api/users/:id` | Delete user | Admin tooling | Admin only |

### GET /api/users

List all users (admin only).

Response:

```json
{
  "users": [
    {
      "id": "uuid",
      "uid": "uuid",
      "username": "demo",
      "email": "demo@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/users/:id

Fetch a user by ID (self or admin).

Response:

```json
{
  "user": {
    "id": "uuid",
    "uid": "uuid",
    "username": "demo",
    "email": "demo@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/users

Create a user (admin only).

Request:

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "avatarUrl": "https://example.com/avatar.png",
  "bio": "Short bio",
  "role": "user"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "uid": "uuid",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/users/:id

Update user fields (self or admin). Role change is admin-only.

Request:

```json
{
  "username": "updated",
  "email": "updated@example.com",
  "password": "newpassword123",
  "fullName": "Updated User",
  "avatarUrl": "https://example.com/avatar.png",
  "bio": "Short bio",
  "role": "admin"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "uid": "uuid",
    "username": "updated",
    "email": "updated@example.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/users/:id

Delete a user (admin only).

Response:

```json
{
  "success": true
}
```

---

## 🧩 Product endpoints

Product catalog for each tenant.

| Method | Path | What | When | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/products` | Create product | New product setup | Owner is req.user |
| GET | `/api/products` | List products | Product list view | Admin sees all |
| POST | `/api/products/:productId/attributes` | Create attribute | Configure options | Product owner only |

### POST /api/products

Create a product owned by the current user.

Request:

```json
{
  "name": "Classic Tee",
  "description": "Short sleeve cotton tee"
}
```

Response:

```json
{
  "product": {
    "id": "uuid",
    "ownerUserId": "uuid",
    "name": "Classic Tee",
    "description": "Short sleeve cotton tee",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/products

List products for the current tenant.

Response:

```json
{
  "products": [
    {
      "id": "uuid",
      "ownerUserId": "uuid",
      "name": "Classic Tee",
      "description": "Short sleeve cotton tee",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/products/:productId/attributes

Create a product-scoped attribute.

Request:

```json
{
  "name": "Material",
  "code": "material",
  "sortOrder": 1
}
```

Response:

```json
{
  "attribute": {
    "id": "uuid",
    "ownerUserId": "uuid",
    "productId": "uuid",
    "name": "Material",
    "code": "material",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🧷 Attribute endpoints

Manage attributes and options under a product.

| Method | Path | What | When | Notes |
| --- | --- | --- | --- | --- |
| PATCH | `/api/attributes/:attributeId` | Update attribute | Rename/reorder/deactivate | Soft delete via isActive |
| POST | `/api/attributes/:attributeId/options` | Create option | Add selectable values | Attribute owner only |
| PATCH | `/api/options/:optionId` | Update option | Rename/reorder/deactivate | Soft delete via isActive |

### PATCH /api/attributes/:attributeId

Update attribute fields.

Request:

```json
{
  "name": "Fabric",
  "sortOrder": 2,
  "isActive": true
}
```

Response:

```json
{
  "attribute": {
    "id": "uuid",
    "ownerUserId": "uuid",
    "productId": "uuid",
    "name": "Fabric",
    "code": "material",
    "sortOrder": 2,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/attributes/:attributeId/options

Create an attribute option.

Request:

```json
{
  "value": "Nylon",
  "sortOrder": 1
}
```

Response:

```json
{
  "option": {
    "id": "uuid",
    "ownerUserId": "uuid",
    "attributeId": "uuid",
    "value": "Nylon",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PATCH /api/options/:optionId

Update an option.

Request:

```json
{
  "value": "Cotton",
  "isActive": false
}
```

Response:

```json
{
  "option": {
    "id": "uuid",
    "ownerUserId": "uuid",
    "attributeId": "uuid",
    "value": "Cotton",
    "sortOrder": 1,
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🧬 Variant endpoints

Create sellable variants and manage pricing.

| Method | Path | What | When | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/products/:productId/variants` | Create variant | SKU + selections | Builds deterministic variantKey |
| PUT | `/api/variants/:variantId/prices` | Upsert prices | Personal/reseller pricing | Cents only |

### POST /api/products/:productId/variants

Create a variant with selections.

Request:

```json
{
  "sku": "TEE-RED-S",
  "unit": "piece",
  "selections": [
    { "attributeId": "uuid", "optionId": "uuid" }
  ]
}
```

Response:

```json
{
  "variant": {
    "id": "uuid",
    "ownerUserId": "uuid",
    "productId": "uuid",
    "sku": "TEE-RED-S",
    "unit": "piece",
    "variantKey": "attributeId:optionId",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/variants/:variantId/prices

Upsert prices for a variant.

Request:

```json
{
  "personalCents": 1999,
  "resellerCents": 1499
}
```

Response:

```json
{
  "prices": [
    { "customerType": "personal", "priceCents": 1999 },
    { "customerType": "reseller", "priceCents": 1499 }
  ]
}
```

---

## 📮 Postman snippets

Use a base URL variable for faster testing.

```text
{{baseUrl}} = http://localhost:3000
```

### Login

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin12345"
}
```

### Get session user (cookie mode)

```http
GET {{baseUrl}}/api/auth/me
```

### Refresh token

```http
POST {{baseUrl}}/api/auth/refresh
```

### Logout

```http
POST {{baseUrl}}/api/auth/logout
```

### List users (admin)

```http
GET {{baseUrl}}/api/users
```

### Create product

```http
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "name": "Classic Tee",
  "description": "Short sleeve cotton tee"
}
```

### List products

```http
GET {{baseUrl}}/api/products
```

### Create attribute

```http
POST {{baseUrl}}/api/products/{{productId}}/attributes
Content-Type: application/json

{
  "name": "Material",
  "code": "material",
  "sortOrder": 1
}
```

### Create option

```http
POST {{baseUrl}}/api/attributes/{{attributeId}}/options
Content-Type: application/json

{
  "value": "Nylon",
  "sortOrder": 1
}
```

### Update attribute

```http
PATCH {{baseUrl}}/api/attributes/{{attributeId}}
Content-Type: application/json

{
  "name": "Fabric",
  "sortOrder": 2,
  "isActive": true
}
```

### Update option

```http
PATCH {{baseUrl}}/api/options/{{optionId}}
Content-Type: application/json

{
  "value": "Cotton",
  "isActive": false
}
```

### Create variant

```http
POST {{baseUrl}}/api/products/{{productId}}/variants
Content-Type: application/json

{
  "sku": "TEE-RED-S",
  "unit": "piece",
  "selections": [
    { "attributeId": "uuid", "optionId": "uuid" }
  ]
}
```

### Upsert variant prices

```http
PUT {{baseUrl}}/api/variants/{{variantId}}/prices
Content-Type: application/json

{
  "personalCents": 1999,
  "resellerCents": 1499
}
```

### Bearer header example

```text
Authorization: Bearer <accessToken>
```

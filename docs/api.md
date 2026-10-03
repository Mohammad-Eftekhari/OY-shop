# API

Route Handlers live under `src/app/api`. They stay thin.

## Response shape

Success:

```json
{ "success": true, "data": {} }
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "displayName", "message": "Display name is required" }]
  }
}
```

| Code                  | Status |
| --------------------- | ------ |
| `VALIDATION_ERROR`    | 400    |
| `UNAUTHENTICATED`     | 401    |
| `FORBIDDEN`           | 403    |
| `NOT_FOUND`           | 404    |
| `CONFLICT`            | 409    |
| `BUSINESS_RULE`       | 422    |
| `RATE_LIMITED`        | 429    |
| `SERVICE_UNAVAILABLE` | 503    |
| `INTERNAL_ERROR`      | 500    |

Unexpected errors are logged and returned as `INTERNAL_ERROR` without a stack trace or SQL. The logger redacts passwords, tokens, cookies, secrets, and email fields.

## Single object and paginated list

A service that loads one record returns that object. If the record does not exist, it throws `AppError("NOT_FOUND", "...")`. The Route Handler does not catch that itself; `handleRoute` maps it to status 404.

`GET /api/profile` is a single object. When the account has not saved a profile yet, the service still returns an object with `persisted: false`. It does not use the list shape and it does not return 404 for that empty draft.

A service that loads many records returns:

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

List query strings are parsed with `listQuerySchema` in `src/lib/api/pagination.ts`: `page` defaults to 1 and must be at least 1, `pageSize` defaults to 20 and must be from 1 to 100. `toLimitOffset` turns that into `limit` and `offset` for the repository. The repository is the only place that calls Drizzle.

## Shop reference

The shop routes are described in [openapi.yaml](./openapi.yaml) (OpenAPI 3.0.3). With the app running, open `/api-docs` for the Swagger UI. The raw document is also served at `GET /api/openapi`. Swagger UI is the viewer. The OpenAPI file is the contract.

## Endpoints in this starter

| Method        | Path                | Access                      |
| ------------- | ------------------- | --------------------------- |
| `GET`, `POST` | `/api/auth/*`       | Better Auth                 |
| `GET`         | `/api/health`       | public, no internals        |
| `GET`         | `/api/me`           | signed in                   |
| `GET`, `PUT`  | `/api/profile`      | signed in, own profile only |
| `GET`         | `/api/admin/status` | role `admin`                |

`PUT /api/profile` ignores any account id in the body. The repository writes `session.user.id`.

## Client calls

`apiFetch(path, schema, init)` sends cookies, parses the envelope, and checks `data` with Zod. `useFetcher` and `useSender` in `src/lib/query` are the only client hooks that should call it.

```tsx
const profile = useFetcher({
  url: EApiRoutes.profile,
  schema: profileResponseSchema,
  enabled: true,
});

const saveProfile = useSender({
  url: EApiRoutes.profile,
  method: "PUT",
  schema: profileResponseSchema,
  invalidateKeys: [profileQueryKeys.current],
});
```

Pass `enabled` to use a normal query with loading and error states. Omit `enabled` to use a suspense query. The query key is the URL plus any `params`, so each page of a list is cached separately. `useSender` supports `POST`, `PUT`, `PATCH`, and `DELETE`, and invalidates the given keys after a successful write.

Same-origin requests are the default. There is no CORS middleware because the browser UI and the API share this origin.

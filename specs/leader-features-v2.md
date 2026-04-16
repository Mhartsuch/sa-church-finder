# Leader Features v2: Review Responses + Service Time Management

## Summary

Two high-impact additions to the Leaders Portal:

1. **Review Responses** — Church leaders can reply to visitor reviews (Google/Yelp-style).
2. **Service Time Management** — CRUD UI for managing `ChurchService` records from the portal.

## Feature 1: Review Responses

### Schema change

Add two nullable fields to the `Review` model:

```prisma
responseBody   String?
respondedAt    DateTime?
```

No new model needed — a review has at most one response from the church.

### API

| Method | Endpoint                | Auth              | Description         |
| ------ | ----------------------- | ----------------- | ------------------- |
| POST   | `/reviews/:id/response` | CHURCH_ADMIN/SITE | Add/update response |
| DELETE | `/reviews/:id/response` | CHURCH_ADMIN/SITE | Remove response     |

Authorization: user must be the church's claimant or a SITE_ADMIN.

### Frontend

- `ReviewManager` component in leader portal per church — shows recent reviews with inline response form.
- Public review cards show the response below the review body when present.

## Feature 2: Service Time Management

### Schema

Uses existing `ChurchService` model — no schema changes.

### API

| Method | Endpoint                       | Auth              | Description    |
| ------ | ------------------------------ | ----------------- | -------------- |
| POST   | `/churches/:churchId/services` | CHURCH_ADMIN/SITE | Create service |
| PATCH  | `/services/:id`                | CHURCH_ADMIN/SITE | Update service |
| DELETE | `/services/:id`                | CHURCH_ADMIN/SITE | Delete service |

### Frontend

- `ServiceManager` component in leader portal per church — lists current services, add/edit/delete.
- `ServiceForm` modal for creating/editing a service time entry.

## Done when

- `npm run typecheck` passes
- `npm run lint` passes
- `npm run build` succeeds
- Schema migration applied
- API_SPEC.md and DATA_MODELS.md updated

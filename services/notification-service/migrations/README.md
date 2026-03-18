# Notification Service Migrations

This service uses MongoDB with Mongoose, so there are no SQL migrations.

Operational notes:

- Ensure `MONGODB_URI` is configured in `.env`.
- Indexes are declared in `src/models/notificationModel.js` and are managed by Mongoose.
- If you need strict migration/versioning later, introduce a migration tool such as `migrate-mongo`.

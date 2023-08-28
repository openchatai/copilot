# OpenCopilot Dashboard

## project structure

- schemas/
  valibot schemas for the api responses, and form validation.(brand new zod alternative few bytes and faster).

- ui/
  - components => small piece that renders markup(most are client components).
  - partials => large components.
  - hooks(custom hooks that can do magic).
  - charts (need more work, but we can use it for now).
  - providers (context providers).
  - utils (helper functions and constants for the ui purpose).
- app/
  - pages and layouts [we are using nextjs13 app router]
    - Layout Groups.
      - (dashboard)
        - the dashboard pages

# Commit Message Guidelines

## Format

All commit messages **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>
```

Where:

- **`<type>`** — describes the purpose of the change (see list below).
- **`<scope>`** — optional; identifies the affected module, package, or feature.
- **`<short description>`** — concise summary of the change, written in **imperative mood** (e.g., _add_, _fix_, _update_, _remove_), **max 50 characters**.

## Examples

feat(auth): add JWT token validation
fix(db): handle null values in product query
refactor(ui): simplify button rendering logic
test(api): add integration tests for user routes
chore(deps): update Fastify to v5.2.0
docs(readme): clarify setup instructions

## Allowed Commit Types

| Type         | Purpose                                                 |
| ------------ | ------------------------------------------------------- |
| **feat**     | Introduce a new feature                                 |
| **fix**      | Fix a bug or regression                                 |
| **refactor** | Code change that neither fixes a bug nor adds a feature |
| **perf**     | Improve performance                                     |
| **docs**     | Documentation changes only                              |
| **style**    | Code style changes (formatting, semicolons, etc.)       |
| **test**     | Add or modify tests                                     |
| **build**    | Changes to build system or dependencies                 |
| **ci**       | CI/CD configuration changes                             |
| **chore**    | Routine maintenance tasks                               |
| **revert**   | Revert a previous commit                                |

## Additional Rules

- Keep the **first line under 50 characters**.
- Use **present tense** and **imperative mood** (“add” not “added” or “adds”).
- Do **not** end the short description with a period.
- Optionally, include a blank line and a detailed description if necessary.

---

**Example with details:**
feat(inventory): add product stock validation

This commit introduces a new validation step before saving a product
to ensure that the stock count is never negative. It also updates
related unit tests.

---

**In short:**  
Write clear, consistent, and meaningful commit messages — they are part of your project’s documentation.

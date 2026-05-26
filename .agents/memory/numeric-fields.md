---
name: Numeric DB Fields Pattern
description: How to handle Drizzle numeric() fields in route handlers
---

## Rule
All `numeric(precision, scale)` Drizzle columns return values as strings from the DB driver. API routes must convert them with `parseFloat()` before sending JSON responses.

**Why:** PostgreSQL numeric type → node-postgres returns strings to avoid floating-point precision loss. Clients expect numbers, not strings.

**How to apply:** In every route file that touches money/decimal fields (prices, amounts, sq footage, rates), map the rows through a `parseFoo(row)` helper that calls `parseFloat(row.fieldName)` on each numeric field. Use `?.toString()` when inserting to convert the incoming number back to string for Drizzle.

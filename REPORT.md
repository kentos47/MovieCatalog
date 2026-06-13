# Final Project Report: "Movie Catalog"

## 1. Introduction

**Project Name:** Movie Catalog — a catalog of movies and TV series.

**Goal:** build a web application for maintaining a personal catalog of watched and planned-to-watch movies and TV series. The user can add, view, and delete entries, specify the type (movie/TV series), year(s), genre, rating (for watched items), status, and watch date.

## 2. Architecture

- **Backend**: Node.js + Express (REST API)
- **Database**: SQLite (file-based)
- **Frontend**: HTML/CSS/JavaScript (static files served via Express)
- **Containerization**: Docker (image based on `node:20-alpine`)

### API Endpoints

- `GET /api/v1/movies` — retrieve all entries
- `POST /api/v1/movies` — add a new entry
- `DELETE /api/v1/movies/:id` — delete an entry

All responses are returned in JSON format: `{ success: boolean, data: any, error: string? }`.

## 3. Implementation

**Project structure:**


```movie-catalog/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── sbom.json
│   └── trivy-report.txt
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── routes/
│   └── movies.js
├── tests/
│   ├── dateUtils.test.js
│   └── movies.test.js
├── database.js
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
├── REPORT.md
└── server.js
```


**Key features:**

- **Input validation** (year, rating, date format) — the server checks that the year is between 1900 and the current year, the rating is between 1 and 10, the date is in DD/MM/YYYY format and not later than today.
- **XSS protection**
- **Parameterized SQL queries**
- **Support for movies and TV series** — TV series have `year_start` and `year_end` fields, and a year range is displayed (e.g., `2013–2016`).
- **Uniqueness** — a movie with the same title and year cannot be added twice.

## 4. Testing

**Test types:**

- **Unit tests:** verification of the date formatting function (`formatDateToDMY`).
- **API integration tests:** CRUD operations, validation, duplicate handling (supertest + jest).

**Running tests:**

```bash
npm test
```

- **This command runs all tests (Jest). Results are printed to the console.**

## 5. Security
**Measures taken:**

    - **XSS: HTML escaping on the frontend.**
    - **SQL injection: parameterized queries.**
    - **Validation: server-side validation of all fields.**
    - **Dependency analysis:**
        ```npm audit --production in CI```
        Trivy (HW7) — 0 vulnerabilities in dependencies.

## 6. CI
**The .github/workflows/ci.yml file runs the following checks on every PR to main:**

    - **Linter and formatter: ESLint + Prettier.**
    - **Tests: npm test.**
    - **Security: npm audit --production.**

**All checks must be green before a PR can be merged.**


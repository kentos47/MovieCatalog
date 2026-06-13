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

text```
movie-catalog/
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




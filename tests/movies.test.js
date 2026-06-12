const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const moviesRouter = require("../routes/movies");
const db = require("../database.js");

const app = express();
app.use(bodyParser.json());
app.use("/api/v1/movies", moviesRouter);

const waitForTable = () => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='movies'", (err, row) => {
        if (err) {
          clearInterval(interval);
          reject(err);
        } else if (row) {
          clearInterval(interval);
          resolve();
        }
      });
    }, 50);
  });
};

beforeAll(async () => {
  await waitForTable();
});

beforeEach((done) => {
  db.run("DELETE FROM movies", (err) => {
    if (err) return done(err);
    done();
  });
});

afterAll((done) => {
  db.close(done);
});

describe("Movies API", () => {
  test("GET /api/v1/movies returns empty array initially", async () => {
    const res = await request(app).get("/api/v1/movies");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test("POST /api/v1/movies adds a new film", async () => {
    const newMovie = {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      status: "Просмотрено",
      rating: 9,
      type: "film",
    };
    const res = await request(app).post("/api/v1/movies").send(newMovie);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");

    const getRes = await request(app).get("/api/v1/movies");
    expect(getRes.body.data.length).toBe(1);
    expect(getRes.body.data[0].title).toBe("Inception");
  });

  test("POST /api/v1/movies validates required fields", async () => {
    const invalidMovie = { title: "Alien" };
    const res = await request(app).post("/api/v1/movies").send(invalidMovie);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Жанр обязателен");
  });

  test("POST /api/v1/movies prevents duplicate film (title + year)", async () => {
    const movie = {
      title: "The Matrix",
      year: 1999,
      genre: "Action",
      status: "В планах",
      type: "film",
    };
    await request(app).post("/api/v1/movies").send(movie);
    const duplicate = await request(app).post("/api/v1/movies").send(movie);
    expect(duplicate.statusCode).toBe(400);
    expect(duplicate.body.error).toBe("Фильм с таким названием и годом уже есть");
  });

  test("DELETE /api/v1/movies/:id removes a movie", async () => {
    const addRes = await request(app).post("/api/v1/movies").send({
      title: "Interstellar",
      year: 2014,
      genre: "Sci-Fi",
      status: "Просмотрено",
      rating: 10,
      type: "film",
    });
    const id = addRes.body.data.id;
    const delRes = await request(app).delete(`/api/v1/movies/${id}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app).get("/api/v1/movies");
    expect(getRes.body.data.length).toBe(0);
  });

  test("DELETE /api/v1/movies/:id returns 404 for non-existent id", async () => {
    const res = await request(app).delete("/api/v1/movies/99999");
    expect(res.statusCode).toBe(404);
  });
});

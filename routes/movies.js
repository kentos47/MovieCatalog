const express = require('express');
const router = express.Router();
const db = require('../database.js');

function validateMovie(data) {
  const { title, genre, status, rating, watch_date, type, year, year_start, year_end } = data;
  const errors = [];
  const currentYear = new Date().getFullYear();

  if (!title || title.length > 200) errors.push('Название: 1-200 символов');
  if (!genre) errors.push('Жанр обязателен');
  if (!status || !['Просмотрено', 'В планах'].includes(status)) errors.push('Статус неверный');
  if (!type || !['film', 'serial'].includes(type)) errors.push('Тип должен быть film/serial');

  if (status === 'Просмотрено') {
    if (!rating || rating < 1 || rating > 10) errors.push('Для просмотренного нужна оценка 1-10');
  } else if (status === 'В планах' && rating && (rating < 1 || rating > 10)) {
    errors.push('Оценка (если есть) от 1 до 10');
  }

  if (type === 'film') {
    if (!year || year < 1900 || year > currentYear) errors.push(`Год фильма от 1900 до ${currentYear}`);
  } else {
    if (!year_start || year_start < 1900 || year_start > currentYear) errors.push('Год начала сериала от 1900 до текущего');
    if (year_end && year_end < year_start) errors.push('Год окончания не может быть раньше года начала');
    if (year_end && year_end > currentYear + 10) errors.push('Год окончания максимум +10 лет');
  }
  return errors;
}

router.get('/', (req, res) => {
  db.all('SELECT * FROM movies ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    res.json({ success: true, data: rows });
  });
});

router.post('/', (req, res) => {
  const { title, genre, status, rating, watch_date, type, year, year_start, year_end } = req.body;
  const errors = validateMovie(req.body);
  if (errors.length) return res.status(400).json({ success: false, error: errors.join(', ') });

  const insert = () => {
    const finalRating = (status === 'В планах' && !rating) ? null : rating;
    let sql, params;
    if (type === 'film') {
      sql = `INSERT INTO movies (title, genre, status, rating, watch_date, type, year) VALUES (?,?,?,?,?,?,?)`;
      params = [title, genre, status, finalRating, watch_date || null, type, year];
    } else {
      sql = `INSERT INTO movies (title, genre, status, rating, watch_date, type, year_start, year_end) VALUES (?,?,?,?,?,?,?,?)`;
      params = [title, genre, status, finalRating, watch_date || null, type, year_start, year_end || null];
    }
    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ success: false, error: 'Ошибка БД: ' + err.message });
      res.status(201).json({ success: true, data: { id: this.lastID } });
    });
  };

  if (type === 'film') {
    db.get('SELECT id FROM movies WHERE title = ? AND type = "film" AND year = ?', [title, year], (err, row) => {
      if (row) return res.status(400).json({ success: false, error: 'Фильм с таким названием и годом уже есть' });
      insert();
    });
  } else {
    const sql = `SELECT id FROM movies WHERE title = ? AND type = 'serial' AND year_start = ? AND (year_end = ? OR (year_end IS NULL AND ? IS NULL))`;
    db.get(sql, [title, year_start, year_end, year_end], (err, row) => {
      if (row) return res.status(400).json({ success: false, error: 'Сериал с таким названием и годами уже есть' });
      insert();
    });
  }
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM movies WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ success: false, error: 'Ошибка удаления' });
    if (this.changes === 0) return res.status(404).json({ success: false, error: 'Не найдено' });
    res.json({ success: true });
  });
});

module.exports = router;

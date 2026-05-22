const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const moviesRouter = require('./routes/movies');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/movies', moviesRouter);

app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

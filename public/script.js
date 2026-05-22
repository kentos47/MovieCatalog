const form = document.getElementById('movieForm');
const typeSelect = document.getElementById('type');
const filmYearDiv = document.getElementById('filmYearField');
const serialYearDiv = document.getElementById('serialYearFields');
const yearInput = document.getElementById('year');
const yearStartInput = document.getElementById('year_start');
const yearEndInput = document.getElementById('year_end');
const statusSelect = document.getElementById('status');
const ratingField = document.getElementById('ratingField');
const dateField = document.getElementById('dateField');
const ratingInput = document.getElementById('rating');
const watchDateInput = document.getElementById('watch_date');
const movieList = document.getElementById('movieList');
const errorMsgDiv = document.getElementById('errorMsg');
const currentYear = new Date().getFullYear();

function toggleYearFields() {
    if (typeSelect.value === 'film') {
        filmYearDiv.style.display = 'block';
        serialYearDiv.style.display = 'none';
        yearInput.required = true;
        yearStartInput.required = false;
        yearEndInput.required = false;
    } else {
        filmYearDiv.style.display = 'none';
        serialYearDiv.style.display = 'block';
        yearInput.required = false;
        yearStartInput.required = true;
    }
}
typeSelect.addEventListener('change', toggleYearFields);
toggleYearFields();

function toggleRatingDate() {
    if (statusSelect.value === 'Просмотрено') {
        ratingField.style.display = 'block';
        dateField.style.display = 'block';
        ratingInput.required = true;
    } else {
        ratingField.style.display = 'none';
        dateField.style.display = 'none';
        ratingInput.required = false;
        ratingInput.value = '';
        watchDateInput.value = '';
    }
}
statusSelect.addEventListener('change', toggleRatingDate);
toggleRatingDate();

function convertToISODate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateToDMY(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

async function loadMovies() {
    try {
        const res = await fetch('/api/v1/movies');
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        renderMovies(data.data);
    } catch (err) {
        showError(err.message);
    }
}

function renderMovies(movies) {
    if (!movies.length) {
        movieList.innerHTML = '<p>Нет записей</p>';
        return;
    }
    movieList.innerHTML = movies.map(m => {
        let yearDisplay = '';
        if (m.type === 'film') yearDisplay = m.year;
        else yearDisplay = m.year_start + (m.year_end ? `–${m.year_end}` : '–...');
        const dateDisplay = m.watch_date ? ` | Дата: ${formatDateToDMY(m.watch_date)}` : '';
        const ratingDisplay = m.rating ? `${m.rating}/10` : '—';
        return `
            <div class="movie-card" data-id="${m.id}">
                <div class="movie-info">
                    <div class="movie-title">${escapeHtml(m.title)} (${yearDisplay})</div>
                    <div class="movie-details">
                        ${m.type === 'film' ? 'Фильм' : 'Сериал'} | Жанр: ${escapeHtml(m.genre)} | 
                        Оценка: ${ratingDisplay} | Статус: ${m.status}${dateDisplay}
                    </div>
                </div>
                <button class="delete-btn" data-id="${m.id}">Удалить</button>
            </div>
        `;
    }).join('');
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteMovie(btn.dataset.id));
    });
}

async function deleteMovie(id) {
    try {
        const res = await fetch(`/api/v1/movies/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        loadMovies();
    } catch (err) {
        showError(err.message);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const status = statusSelect.value;
    const type = typeSelect.value;
    const payload = { title, genre, status, type };

    if (type === 'film') {
        const year = parseInt(yearInput.value);
        if (isNaN(year) || year < 1900 || year > currentYear) {
            return showError(`Год фильма от 1900 до ${currentYear}`);
        }
        payload.year = year;
    } else {
        const start = parseInt(yearStartInput.value);
        if (isNaN(start) || start < 1900 || start > currentYear) {
            return showError('Год начала от 1900 до текущего');
        }
        payload.year_start = start;
        const endRaw = yearEndInput.value.trim();
        if (endRaw) {
            const end = parseInt(endRaw);
            if (end < start) return showError('Год окончания не раньше года начала');
            payload.year_end = end;
        }
    }

    if (status === 'Просмотрено') {
        const rating = parseInt(ratingInput.value);
        if (isNaN(rating) || rating < 1 || rating > 10) {
            return showError('Оценка должна быть 1-10');
        }
        payload.rating = rating;
        const dateRaw = watchDateInput.value.trim();
        if (dateRaw) {
            const isoDate = convertToISODate(dateRaw);
            if (!isoDate) return showError('Дата в формате ДД/ММ/ГГГГ, не позже сегодня');
            payload.watch_date = isoDate;
        }
    }

    try {
        const res = await fetch('/api/v1/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        form.reset();
        toggleYearFields();
        toggleRatingDate();
        loadMovies();
        errorMsgDiv.innerText = '';
    } catch (err) {
        showError('Ошибка: ' + err.message);
    }
});

function showError(msg) {
    errorMsgDiv.innerText = msg;
    setTimeout(() => errorMsgDiv.innerText = '', 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

loadMovies();

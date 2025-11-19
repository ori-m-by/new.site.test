/******************************************************************
 * 0) CONFIG
 ******************************************************************/
const AUTH_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1EYGrBVteGM4_kXhc6owSxicwIrMp6FkzV74AjZdeAeM/export?format=csv&gid=0";

const moviesCsvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";

const seriesListId   = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const seriesListName = "טבלת סדרות";
const episodesId     = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";

let allMovies = [];
let allSeries = [];
let isSeriesMode = false;

const fallbackImage =
  "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

/******************************************************************


/******************************************************************
 * 2) START REAL APP — כל הקוד המקורי שלך כאן
 ******************************************************************/
function startApp() {
    console.log("🎬 App unlocked — loading movies…");

    /* ---- כל הקוד המקורי שלך להלן, ללא שינויים ---- */

    function createMovieCard(data) {
        const heb    = data["שם הסרט בעברית"]     || "";
        const eng    = data["שם הסרט באנגלית"]    || "";
        const pic    = data["קישור לתמונה"]        || fallbackImage;
        const year   = data["שנת יציאה"]          || "";
        const genre  = data["ז'אנר"]               || "";
        const desc   = data["תיאור קצר"]           || "";
        const dir    = data["במאי"]                || "";
        const actors = data["שחקנים ראשיים"]      || "";
        const writer = data["תסריטאי"]             || "";
        const prod   = data["מפיק"]                || "";
        const score  = data["ציון IMDb"]           || "";
        const awards = data["פרסים והישגים בולטים"] || "";
        const pg     = data["סרט לילדים / מבוגרים"]|| "";
        const viewL  = (data["קישור לדרייב"]    || "").trim();
        const imdbL  = (data["קישור ל-IMDb"]   || "").trim();

        const card = document.createElement("div");
        card.className = "col-12 col-md-6 mb-4";

        const inner = document.createElement("div");
        inner.className = "card shadow-sm movie-card";

        const textCol = document.createElement("div");
        textCol.className = "movie-content";
        textCol.innerHTML = `
            <h5>${heb}</h5>
            <h6 class="text-muted">${eng}</h6>
            <p><strong>שנה:</strong> ${year}<br>
               <strong>ז'אנר:</strong> ${genre}</p>
            <p>${desc}</p>
        `;

        const img = document.createElement("img");
        img.src = pic;
        img.className = "movie-image";
        img.onerror = () => img.src = fallbackImage;

        const posterCol = document.createElement("div");
        posterCol.className = "right-side";
        posterCol.append(img);

        const row = document.createElement("div");
        row.className = "d-flex";
        row.append(textCol, posterCol);

        inner.append(row);
        card.append(inner);
        return card;
    }

    function createSeriesCard(s) {
        const heb  = s["שם הסדרה בעברית"] || "";
        const eng  = s["שם הסדרה באנגלית"] || "";
        const desc = s["תיאור קצר"] || "";
        const pic  = s["קישור לתמונה"] || fallbackImage;

        const card = document.createElement("div");
        card.className = "col-12 col-md-6 mb-4";

        const img = document.createElement("img");
        img.src = pic;
        img.className = "card-img-top movie-image";
        img.onerror = () => img.src = fallbackImage;

        const body = document.createElement("div");
        body.className = "card-body";
        body.innerHTML = `
            <h5>${heb}</h5>
            <h6 class="text-muted">${eng}</h6>
            <p>${desc}</p>
            <button class="btn btn-outline-primary" onclick="loadEpisodes('${encodeURIComponent(heb)}')">
                📂 ראה עונות ופרקים
            </button>
        `;

        const inner = document.createElement("div");
        inner.className = "card shadow-sm movie-card";
        inner.append(img, body);

        card.append(inner);
        return card;
    }

    function renderMovies(list) {
        const c = document.getElementById("moviecontainer");
        c.innerHTML = "";
        list.forEach(m => c.append(createMovieCard(m)));
    }

    function renderSeries(list) {
        const c = document.getElementById("moviecontainer");
        c.innerHTML = "";
        const back = document.createElement("button");
        back.className = "btn btn-outline-secondary mb-3";
        back.textContent = "🔙 חזרה לסדרות";
        back.onclick = loadSeries;
        c.append(back);
        list.forEach(s => c.append(createSeriesCard(s)));
    }

    function applyFilters() {
        if (isSeriesMode) return;
        const q = document.getElementById("searchInput").value.toLowerCase();
        const filtered = allMovies.filter(m =>
            Object.values(m).some(v => v && v.toLowerCase().includes(q))
        );
        renderMovies(filtered);
    }

    function loadMovies() {
        isSeriesMode = false;

        fetch(moviesCsvUrl)
            .then(r => r.text())
            .then(csv => {
                allMovies = Papa.parse(csv, { header: true }).data
                    .filter(r => r["שם הסרט בעברית"]);
                renderMovies(allMovies);
            });
    }

    function loadSeries() {
        isSeriesMode = true;

        const url =
          `https://docs.google.com/spreadsheets/d/${seriesListId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesListName)}`;

        fetch(url)
            .then(r => r.text())
            .then(csv => {
                allSeries = Papa.parse(csv, { header: true }).data
                    .filter(r => r["שם הסדרה בעברית"]);
                renderSeries(allSeries);
            });
    }

    function loadEpisodes(encodedName) {
        const seriesName = decodeURIComponent(encodedName);
        const url =
          `https://docs.google.com/spreadsheets/d/${episodesId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesName)}`;

        const container = document.getElementById("moviecontainer");
        container.innerHTML = `<p class="text-center py-5">טוען פרקים…</p>`;

        fetch(url)
            .then(r => r.text())
            .then(csv => {
                const eps = Papa.parse(csv, { header: true }).data
                    .filter(ep => ep["שם הפרק"]);

                container.innerHTML = "";

                eps.forEach(ep => {
                    const card = document.createElement("div");
                    card.className = "card mb-3";
                    card.innerHTML = `
                        <div class="card-body">
                            <h5>${ep["שם הפרק"]}</h5>
                            <p>${ep["תיאור"]}</p>
                            ${ep["קישור"] ? `<a href="${ep["קישור"]}" class="btn btn-primary" target="_blank">▶️ צפייה</a>` : ""}
                        </div>`;
                    container.append(card);
                });
            });
    }

    document.getElementById("toggleViewBtn").addEventListener("click", () => {
        if (isSeriesMode) loadMovies();
        else loadSeries();
    });

    loadMovies();
}


// main.js

// ────────────────────────────────────────────────────────────────────────────
// 0) Config & state
// ────────────────────────────────────────────────────────────────────────────
const moviesCsvUrl   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy3QmBmzq23a0pVmV7GBNa8ryYiKiIes8VclVTfCiwqPRITOxxSrZt8dT9aTCkpQ/pub?output=csv";
const seriesListId   = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const seriesListName = "טבלת סדרות";
const episodesId     = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";

let allMovies    = [];
let allSeries    = [];
let isSeriesMode = false;

const fallbackImage = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

// ────────────────────────────────────────────────────────────────────────────
// 1) createMovieCard
// ────────────────────────────────────────────────────────────────────────────
function createMovieCard(data) {
  // 1) נתונים
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

  // 2) קליינרים
  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  const inner = document.createElement("div");
  inner.className = "card shadow-sm movie-card";
  inner.addEventListener("mouseenter", () => inner.classList.add("show-info"));
  inner.addEventListener("mouseleave", () => inner.classList.remove("show-info"));

  // 3) עמודת טקסט + תמונה שנייה מתחת לטקסט
  const textCol = document.createElement("div");
  textCol.className = "movie-content";
  textCol.innerHTML = `
    <h5 class="card-title">${heb}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${eng}</h6>
    <p><strong>שנה:</strong> ${year}<br><strong>ז'אנר:</strong> ${genre}</p>
    <p>${desc}</p>
  `;
  const txtImg = document.createElement("img");
  txtImg.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה%20לאתר%202.jpg";
  txtImg.alt = "תמונה לאתר 2";
  txtImg.className = "text-extra-image";
  textCol.append(txtImg);

  // overlay פירוט
  const extra = document.createElement("div");
  extra.className = "extra-info";
  extra.innerHTML = `
      <p><strong>במאי:</strong> ${dir}<br>
         <strong>שחקנים:</strong> ${actors}<br>
         <strong>תסריטאי:</strong> ${writer}<br>
         <strong>מפיק:</strong> ${prod}<br>
         <strong>IMDB:</strong> ${score}<br>
         <strong>פרסים:</strong> ${awards}<br>
         <strong>קהל יעד:</strong> ${pg}</p>
      ${viewL.startsWith("http") ? `<a href="${viewL}" target="_blank" class="btn btn-primary mb-2">▶️ צפייה</a>` : ""}
      ${imdbL.startsWith("http") ? `<a href="${imdbL}" target="_blank" class="btn btn-secondary mb-2 ms-2">📺 IMDb</a>` : ""}
  `;
  textCol.append(extra);

  // 4) עמודת פוסטר + התמונה הראשונה מתחת לפוסטר
  const imgCol = document.createElement("div");
  imgCol.className = "right-side";

  const img = document.createElement("img");
  img.src = pic;
  img.alt = heb;
  img.className = "movie-image";
  img.onerror = () => { img.src = fallbackImage; };
  imgCol.append(img);

  const extraPoster = document.createElement("img");
  extraPoster.src = "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה%20לאתר.png";
  extraPoster.alt = "תמונה לאתר";
  extraPoster.className = "poster-extra-image";
  imgCol.append(extraPoster);

  // 5) הרכבה
  const row = document.createElement("div");
  row.className = "d-flex";
  row.append(textCol, imgCol);

  inner.append(row);
  card.append(inner);

  return card;
}

// ────────────────────────────────────────────────────────────────────────────
// 2) createSeriesCard
// ────────────────────────────────────────────────────────────────────────────
function createSeriesCard(s) {
  const heb   = s["שם הסדרה בעברית"]       || "";
  const eng   = s["שם הסדרה באנגלית"]      || "";
  const desc  = s["תיאור קצר"]             || "";
  const pic   = s["קישור לתמונה"]          || fallbackImage;

  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  const inner = document.createElement("div");
  inner.className = "card shadow-sm movie-card";
  inner.addEventListener("mouseenter", () => inner.classList.add("show-info"));
  inner.addEventListener("mouseleave", () => inner.classList.remove("show-info"));

  const img = document.createElement("img");
  img.src = pic;
  img.alt = heb;
  img.className = "card-img-top movie-image";
  img.onerror = () => { img.src = fallbackImage; };

  const bd = document.createElement("div");
  bd.className = "card-body";
  bd.innerHTML = `
    <h5 class="card-title">${heb}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${eng}</h6>
    <p class="card-text">${desc}</p>
    <div class="extra-info">
      <p><strong>שם הסדרה:</strong> ${heb}<br>
         <strong>תיאור:</strong> ${desc}</p>
      <button class="btn btn-outline-primary" onclick="loadEpisodes('${encodeURIComponent(heb)}')">
        📂 ראה עונות ופרקים
      </button>
    </div>
  `;

  inner.append(img, bd);
  card.append(inner);
  return card;
}

// ────────────────────────────────────────────────────────────────────────────
// 3) render helpers
// ────────────────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────────────────
// 4) applyFilters
// ────────────────────────────────────────────────────────────────────────────
function applyFilters() {
  if (isSeriesMode) return;
  const y = document.getElementById("yearFilter").value;
  const r = parseFloat(document.getElementById("ratingFilter").value) || 0;
  const g = document.getElementById("genreFilter").value.toLowerCase();
  const p = document.getElementById("pgFilter").value.toLowerCase();
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allMovies.filter(m => {
    const ym = !y || m["שנת יציאה"] === y;
    const rm = (parseFloat(m["ציון IMDb"])||0) >= r;
    const gm = !g || (m["ז'אנר"]||"").toLowerCase().split(",").map(x=>x.trim()).includes(g);
    const pm = !p || (m["סרט לילדים / מבוגרים"]||"").toLowerCase() === p;
    const sm = [m["שם הסרט בעברית"], m["שם הסרט באנגלית"], m["במאי"], m["שחקנים ראשיים"], m["תיאור קצר"]]
                 .some(f => f && f.toLowerCase().includes(q));
    return ym && rm && gm && pm && sm;
  });

  renderMovies(filtered);
}

// ────────────────────────────────────────────────────────────────────────────
// 5) loadMovies
// ────────────────────────────────────────────────────────────────────────────
function loadMovies() {
  isSeriesMode = false;
  document.body.classList.remove("series-mode");
  document.querySelector("h1").textContent = "🎬 הסרטים שלנו";
  document.getElementById("toggleViewBtn").textContent = "📺 מעבר לתצוגת סדרות";
  document.querySelector(".filter-bar").style.display = "";

  fetch(moviesCsvUrl)
    .then(r => r.text())
    .then(csv => {
      allMovies = Papa.parse(csv, { header: true }).data
                     .filter(r => r["שם הסרט בעברית"]);
      renderMovies(allMovies);

      // build filters...
      // years
      const years = [...new Set(allMovies.map(m=>m["שנת יציאה"]).filter(Boolean))].sort();
      const ySel = document.getElementById("yearFilter");
      years.forEach(y => {
        const o = document.createElement("option");
        o.value = o.textContent = y;
        ySel.append(o);
      });

      // genres
      const gset = new Set();
      allMovies.forEach(m => (m["ז'אנר"]||"").split(",").forEach(x=>x.trim()&&gset.add(x.trim())));
      const gSel = document.getElementById("genreFilter");
      [...gset].sort().forEach(g => {
        const o = document.createElement("option");
        o.value = o.textContent = g;
        gSel.append(o);
      });

      // pg
      const pset = new Set(allMovies.map(m=>m["סרט לילדים / מבוגרים"]).filter(Boolean));
      const pSel = document.getElementById("pgFilter");
      [...pset].sort().forEach(pv => {
        const o = document.createElement("option");
        o.value = o.textContent = pv;
        pSel.append(o);
      });
    })
    .catch(err => console.error("loadMovies:", err));
}

// ────────────────────────────────────────────────────────────────────────────
// 6) loadSeries
// ────────────────────────────────────────────────────────────────────────────
function loadSeries() {
  isSeriesMode = true;
  document.body.classList.add("series-mode");

  document.querySelector("h1").textContent = "📺 הסדרות שלנו";
  document.getElementById("toggleViewBtn").textContent = "🎬 חזרה לסרטים";
  document.querySelector(".filter-bar").style.display = "none";

  const url = `https://docs.google.com/spreadsheets/d/${seriesListId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesListName)}`;
  fetch(url)
    .then(r => r.text())
    .then(csv => {
      allSeries = Papa.parse(csv, { header: true }).data
                     .filter(r => r["שם הסדרה בעברית"]);
      renderSeries(allSeries);
    })
    .catch(err => console.error("loadSeries:", err));
}

// ────────────────────────────────────────────────────────────────────────────
// 7) loadEpisodes
// ────────────────────────────────────────────────────────────────────────────
function loadEpisodes(encodedName) {
  const seriesName = decodeURIComponent(encodedName);
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center py-5">🔄 טוען פרקים של ${seriesName}…</div>`;

  const url = `https://docs.google.com/spreadsheets/d/${episodesId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(seriesName)}`;
  fetch(url)
    .then(r => r.text())
    .then(csv => {
      const eps = Papa.parse(csv, { header: true }).data
                     .filter(ep => ep["שם הפרק"]);

      const grouped = {};
      eps.forEach(ep => {
        const s = parseInt(ep["עונה"], 10);
        if (!grouped[s]) grouped[s] = [];
        grouped[s].push(ep);
      });

      container.innerHTML = "";
      const back = document.createElement("button");
      back.className = "btn btn-outline-secondary mb-3";
      back.textContent = "🔙 חזרה לסדרות";
      back.onclick = loadSeries;
      container.append(back);

      Object.keys(grouped)
        .map(n=>parseInt(n,10))
        .sort((a,b)=>a-b)
        .forEach(seasonNum => {
          const btn = document.createElement("button");
          btn.className = "btn btn-info m-2";
          btn.textContent = `עונה ${seasonNum}`;
          btn.onclick = () => showEpisodesInSeason(seriesName, grouped[seasonNum], seasonNum);
          container.append(btn);
        });
    })
    .catch(err => console.error("loadEpisodes:", err));
}

// ────────────────────────────────────────────────────────────────────────────
// 8) showEpisodesInSeason
// ────────────────────────────────────────────────────────────────────────────
function showEpisodesInSeason(seriesName, episodesList, seasonNum) {
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<h3 class="text-center mb-4">${seriesName} – עונה ${seasonNum}</h3>`;

  const backToSeasons = document.createElement("button");
  backToSeasons.className = "btn btn-outline-secondary mb-3";
  backToSeasons.textContent = "🔙 חזרה לעונות";
  backToSeasons.onclick = () => loadEpisodes(encodeURIComponent(seriesName));
  container.append(backToSeasons);

  episodesList.forEach(ep => {
    const card = document.createElement("div");
    card.className = "card mb-3";

    const row = document.createElement("div");
    row.className = "row g-0";

    const colImg = document.createElement("div");
    colImg.className = "col-md-4";
    const img = document.createElement("img");
    img.src = ep["תמונה"] || fallbackImage;
    img.className = "img-fluid rounded-start";
    img.onerror = () => { img.src = fallbackImage; };
    colImg.append(img);

    const colBody = document.createElement("div");
    colBody.className = "col-md-8";
    const bd = document.createElement("div");
    bd.className = "card-body";
    bd.innerHTML = `
      <h5 class="card-title">${ep["שם הפרק"]} (פרק ${ep["מספר פרק"]})</h5>
      <p class="card-text"><small class="text-muted">תאריך: ${ep["תאריך שידור"]}</small></p>
      <p class="card-text">${ep["תיאור"]}</p>
      ${ep["קישור"] ? `<a href="${ep["קישור"]}" target="_blank" class="btn btn-primary">▶️ צפייה</a>` : ""}
    `;
    colBody.append(bd);

    row.append(colImg, colBody);
    card.append(row);
    container.append(card);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 9) Toggle & init
// ────────────────────────────────────────────────────────────────────────────
document.getElementById("toggleViewBtn").addEventListener("click", () => {
  if (isSeriesMode) {
    loadMovies();
  } else {
    loadSeries();
  }
});

// נטען אוטומטית לאחר התחברות
document.addEventListener("DOMContentLoaded", loadMovies);

// main.js

const WORKER = "https://royal-lab-55af.orimoshe-by.workers.dev";

/* טבלאות */
const MOVIES_SHEET_ID = "1fipo99hdn-PZv2GwNVBd5boXTnmcuD_d";
const SERIES_LIST_ID  = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const EPISODES_SHEET_ID = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";

let allMovies = [];
let allSeries = [];
let isSeriesMode = false;

const fallbackImage =
  "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";


/****************************************************************
 * 1) הבאת גליון דרך Worker
 ****************************************************************/
async function loadSheet(sheetId, sheetName = "") {
  const token = localStorage.getItem("gs_token");

  const url = `${WORKER}/?sheet=${sheetId}${sheetName ? `&name=${encodeURIComponent(sheetName)}` : ""}`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("worker fetch failed");

  return await res.json();
}


/****************************************************************
 * 2) המרה של Google Sheets GridData → מערך אובייקטים
 ****************************************************************/
function sheetToObjects(sheetData) {
  try {
    const rows = sheetData.sheets[0].data[0].rowData;

    const headers = rows[0].values.map(v => v.formattedValue);

    const result = [];

    rows.slice(1).forEach(r => {
      if (!r.values) return;
      const obj = {};
      r.values.forEach((cell, i) => {
        obj[headers[i]] = cell?.formattedValue || "";
      });
      result.push(obj);
    });

    return result;

  } catch (err) {
    console.error("parse error:", err);
    return [];
  }
}


/****************************************************************
 * 3) טעינת סרטים
 ****************************************************************/
async function loadMovies() {
  isSeriesMode = false;

  document.querySelector("h1").textContent = "🎬 הסרטים שלנו";
  document.getElementById("toggleViewBtn").textContent = "📺 מעבר לתצוגת סדרות";

  const raw = await loadSheet(MOVIES_SHEET_ID);
  allMovies = sheetToObjects(raw).filter(m => m["שם הסרט בעברית"]);

  renderMovies(allMovies);

  /* ----- בניית סינונים ----- */
  const years = [...new Set(allMovies.map(m => m["שנת יציאה"]).filter(Boolean))].sort();
  const ySel = document.getElementById("yearFilter");
  ySel.innerHTML = '<option value="">כל השנים</option>';
  years.forEach(y => {
    ySel.innerHTML += `<option>${y}</option>`;
  });

  const gset = new Set();
  allMovies.forEach(m =>
    (m["ז'אנר"] || "").split(",").forEach(x => x.trim() && gset.add(x.trim()))
  );
  const gSel = document.getElementById("genreFilter");
  gSel.innerHTML = '<option value="">כל הז\'אנרים</option>';
  [...gset].sort().forEach(g => {
    gSel.innerHTML += `<option>${g}</option>`;
  });

  const pset = new Set(allMovies.map(m => m["סרט לילדים / מבוגרים"]).filter(Boolean));
  const pSel = document.getElementById("pgFilter");
  pSel.innerHTML = '<option value="">כל סוגי הקהל</option>';
  [...pset].sort().forEach(pv => {
    pSel.innerHTML += `<option>${pv}</option>`;
  });
}


/****************************************************************
 * 4) טעינת רשימת סדרות
 ****************************************************************/
async function loadSeries() {
  isSeriesMode = true;

  document.querySelector("h1").textContent = "📺 הסדרות שלנו";
  document.getElementById("toggleViewBtn").textContent = "🎬 חזרה לסרטים";

  const raw = await loadSheet(SERIES_LIST_ID, "טבלת סדרות");
  allSeries = sheetToObjects(raw).filter(s => s["שם הסדרה בעברית"]);

  renderSeries(allSeries);
}


/****************************************************************
 * 5) טעינת פרקים
 ****************************************************************/
async function loadEpisodes(seriesName) {
  const raw = await loadSheet(EPISODES_SHEET_ID, seriesName);
  const eps = sheetToObjects(raw).filter(ep => ep["שם הפרק"]);

  const grouped = {};
  eps.forEach(ep => {
    const s = parseInt(ep["עונה"], 10);
    if (!grouped[s]) grouped[s] = [];
    grouped[s].push(ep);
  });

  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<button class="btn btn-outline-secondary mb-3" onclick="loadSeries()">🔙 חזרה לסדרות</button>`;

  Object.keys(grouped)
    .map(n => parseInt(n, 10))
    .sort((a, b) => a - b)
    .forEach(season => {
      const btn = document.createElement("button");
      btn.className = "btn btn-info m-2";
      btn.textContent = `עונה ${season}`;
      btn.onclick = () => showEpisodesInSeason(seriesName, grouped[season], season);
      container.append(btn);
    });
}


/****************************************************************
 * 6) הצגת פרקים של עונה
 ****************************************************************/
function showEpisodesInSeason(seriesName, eps, seasonNum) {
  const container = document.getElementById("moviecontainer");

  container.innerHTML =
    `<h3 class="text-center mb-4">${seriesName} – עונה ${seasonNum}</h3>
     <button class="btn btn-outline-secondary mb-3"
       onclick="loadEpisodes('${seriesName}')">🔙 חזרה לעונות</button>`;

  eps.forEach(ep => {
    const card = document.createElement("div");
    card.className = "card mb-3";

    const row = document.createElement("div");
    row.className = "row g-0";

    const colImg = document.createElement("div");
    colImg.className = "col-md-4";
    const img = document.createElement("img");
    img.src = ep["תמונה"] || fallbackImage;
    img.className = "img-fluid rounded-start";
    img.onerror = () => img.src = fallbackImage;
    colImg.append(img);

    const colBody = document.createElement("div");
    colBody.className = "col-md-8";
    colBody.innerHTML =
      `<div class="card-body">
        <h5 class="card-title">${ep["שם הפרק"]} (פרק ${ep["מספר פרק"]})</h5>
        <p class="card-text"><small>${ep["תאריך שידור"]}</small></p>
        <p>${ep["תיאור"]}</p>
        ${ep["קישור"] ? `<a href="${ep["קישור"]}" target="_blank" class="btn btn-primary">▶️ צפייה</a>` : ""}
      </div>`;

    row.append(colImg, colBody);
    card.append(row);

    container.append(card);
  });
}


/****************************************************************
 * 7) יצירת כרטיסי סרטים/סדרות
 ****************************************************************/
function createMovieCard(m) {
  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  card.innerHTML = `
    <div class="card shadow-sm movie-card">
      <div class="d-flex">
        <div class="movie-content">
          <h5>${m["שם הסרט בעברית"]}</h5>
          <h6 class="text-muted">${m["שם הסרט באנגלית"]}</h6>
          <p><strong>שנה:</strong> ${m["שנת יציאה"]}<br>
             <strong>ז'אנר:</strong> ${m["ז'אנר"]}</p>
          <p>${m["תיאור קצר"]}</p>

          <div class="extra-info">
            <p><strong>במאי:</strong> ${m["במאי"]}<br>
               <strong>שחקנים:</strong> ${m["שחקנים ראשיים"]}<br>
               <strong>IMDB:</strong> ${m["ציון IMDb"]}</p>

            ${m["קישור לדרייב"] ? `<a href="${m["קישור לדרייב"]}" target="_blank" class="btn btn-primary mb-2">▶️ צפייה</a>` : ""}
            ${m["קישור ל-IMDb"] ? `<a href="${m["קישור ל-IMDb"]}" target="_blank" class="btn btn-secondary ms-2 mb-2">📺 IMDb</a>` : ""}
          </div>
        </div>

        <div class="right-side">
          <img src="${m["קישור לתמונה"] || fallbackImage}"
               class="movie-image"
               onerror="this.src='${fallbackImage}'">
        </div>
      </div>
    </div>
  `;

  return card;
}


function createSeriesCard(s) {
  const card = document.createElement("div");
  card.className = "col-12 col-md-6 mb-4";

  card.innerHTML = `
    <div class="card shadow-sm movie-card">
      <img src="${s["קישור לתמונה"] || fallbackImage}"
           class="card-img-top movie-image"
           onerror="this.src='${fallbackImage}'">

      <div class="card-body">
        <h5>${s["שם הסדרה בעברית"]}</h5>
        <h6 class="text-muted">${s["שם הסדרה באנגלית"]}</h6>
        <p>${s["תיאור קצר"]}</p>

        <div class="extra-info">
          <button class="btn btn-outline-primary"
            onclick="loadEpisodes('${s["שם הסדרה בעברית"]}')">
            📂 ראה עונות ופרקים
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}


/****************************************************************
 * 8) הצגה
 ****************************************************************/
function renderMovies(list) {
  const c = document.getElementById("moviecontainer");
  c.innerHTML = "";
  list.forEach(m => c.append(createMovieCard(m)));
}

function renderSeries(list) {
  const c = document.getElementById("moviecontainer");
  c.innerHTML = "";
  list.forEach(s => c.append(createSeriesCard(s)));
}


/****************************************************************
 * 9) סינון
 ****************************************************************/
function applyFilters() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  if (isSeriesMode) {
    const filtered = allSeries.filter(s =>
      [s["שם הסדרה בעברית"], s["שם הסדרה באנגלית"], s["תיאור קצר"]]
        .some(v => v && v.toLowerCase().includes(q))
    );
    renderSeries(filtered);
    return;
  }

  const y = document.getElementById("yearFilter").value;
  const r = parseFloat(document.getElementById("ratingFilter").value) || 0;
  const g = document.getElementById("genreFilter").value.toLowerCase();
  const p = document.getElementById("pgFilter").value.toLowerCase();

  const filtered = allMovies.filter(m => {
    const ym = !y || m["שנת יציאה"] === y;
    const rm = (parseFloat(m["ציון IMDb"]) || 0) >= r;
    const gm = !g || (m["ז'אנר"] || "").toLowerCase().includes(g);
    const pm = !p || (m["סרט לילדים / מבוגרים"] || "").toLowerCase() === p;

    const sm = [m["שם הסרט בעברית"], m["שם הסרט באנגלית"], m["במאי"], m["שחקנים ראשיים"], m["תיאור קצר"]]
      .some(v => v && v.toLowerCase().includes(q));

    return ym && rm && gm && pm && sm;
  });

  renderMovies(filtered);
}


/****************************************************************
 * 10) כפתור מעבר
 ****************************************************************/
document.getElementById("toggleViewBtn").addEventListener("click", () => {
  if (isSeriesMode) loadMovies();
  else loadSeries();
});


/****************************************************************
 * 11) התחלה
 ****************************************************************/
document.addEventListener("DOMContentLoaded", loadMovies);

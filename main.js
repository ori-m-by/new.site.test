// main.js

// כל הקריאות לגיליון עוברות דרך ה-Worker
const WORKER_URL = "https://royal-lab-55af.orimoshe-by.workers.dev";

// IDs של הטבלאות
const MOVIES_SHEET_ID   = "1fipo99hdn-PZv2GwNVBd5boXTnmcuD_d";
const SERIES_LIST_ID    = "1yYRTUq6iRh0dfhFFFpVJiR351jXS2Ll-9VCjsLrTW0Y";
const EPISODES_SHEET_ID = "1XkZ4in53qT3mCImgrNlqv74JKKW9lG_ZieFGwcJpd5s";
const SERIES_LIST_SHEET_NAME = "טבלת סדרות";

let allMovies    = [];
let allSeries    = [];
let isSeriesMode = false;

const fallbackImage =
  "https://raw.githubusercontent.com/ori-m-by/bar-yosef-movie-site/main/תמונה_לא_טעונה.png";

/****************************************************************
 * 1) הבאת גליון דרך Worker והמרה למערך אובייקטים
 ****************************************************************/
async function loadSheet(sheetId, sheetName = "") {
  const url = `${WORKER_URL}?sheet=${sheetId}${
    sheetName ? `&name=${encodeURIComponent(sheetName)}` : ""
  }`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    console.error("Worker error:", res.status, txt);
    throw new Error("worker fetch failed");
  }

  const data = await res.json();
  const values = data.valueRanges?.[0]?.values || [];
  if (!values.length) return [];

  const headers = values[0];
  const rows = values.slice(1);

  const objects = rows.map(row => {
    const obj = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      obj[h] = row[idx] !== undefined ? row[idx] : "";
    });
    return obj;
  });

  return objects;
}

/****************************************************************
 * 2) יצירת כרטיס סרט
 ****************************************************************/
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
  inner.addEventListener("mouseenter", () => inner.classList.add("show-info"));
  inner.addEventListener("mouseleave", () => inner.classList.remove("show-info"));

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

  const row = document.createElement("div");
  row.className = "d-flex";
  row.append(textCol, imgCol);

  inner.append(row);
  card.append(inner);

  return card;
}

/****************************************************************
 * 3) כרטיס סדרה
 ****************************************************************/
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

/****************************************************************
 * 4) Render helpers
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
 * 5) טעינת סרטים
 ****************************************************************/
async function loadMovies() {
  isSeriesMode = false;
  document.body.classList.remove("series-mode");
  document.querySelector("h1").textContent = "🎬 הסרטים שלנו";
  document.getElementById("toggleViewBtn").textContent = "📺 מעבר לתצוגת סדרות";
  document.querySelector(".filter-bar").style.display = "";

  const rows = await loadSheet(MOVIES_SHEET_ID);
  allMovies = rows.filter(r => r["שם הסרט בעברית"]);
  renderMovies(allMovies);

  // סינון: שנים
  const years = [...new Set(allMovies.map(m=>m["שנת יציאה"]).filter(Boolean))].sort();
  const ySel = document.getElementById("yearFilter");
  ySel.innerHTML = '<option value="">כל השנים</option>';
  years.forEach(y => {
    const o = document.createElement("option");
    o.value = o.textContent = y;
    ySel.append(o);
  });

  // סינון: ז'אנרים
  const gset = new Set();
  allMovies.forEach(m => (m["ז'אנר"]||"").split(",").forEach(x=>x.trim()&&gset.add(x.trim())));
  const gSel = document.getElementById("genreFilter");
  gSel.innerHTML = '<option value="">כל הז\'אנרים</option>';
  [...gset].sort().forEach(g => {
    const o = document.createElement("option");
    o.value = o.textContent = g;
    gSel.append(o);
  });

  // סינון: קהל יעד
  const pset = new Set(allMovies.map(m=>m["סרט לילדים / מבוגרים"]).filter(Boolean));
  const pSel = document.getElementById("pgFilter");
  pSel.innerHTML = '<option value="">כל סוגי הקהל</option>';
  [...pset].sort().forEach(pv => {
    const o = document.createElement("option");
    o.value = o.textContent = pv;
    pSel.append(o);
  });
}

/****************************************************************
 * 6) טעינת רשימת סדרות
 ****************************************************************/
async function loadSeries() {
  isSeriesMode = true;
  document.body.classList.add("series-mode");

  document.querySelector("h1").textContent = "📺 הסדרות שלנו";
  document.getElementById("toggleViewBtn").textContent = "🎬 חזרה לסרטים";
  document.querySelector(".filter-bar").style.display = "";

  const rows = await loadSheet(SERIES_LIST_ID, SERIES_LIST_SHEET_NAME);
  allSeries = rows.filter(r => r["שם הסדרה בעברית"]);
  renderSeries(allSeries);
}

/****************************************************************
 * 7) טעינת פרקים עבור סדרה
 ****************************************************************/
async function loadEpisodes(encodedName) {
  const seriesName = decodeURIComponent(encodedName);
  const container = document.getElementById("moviecontainer");
  container.innerHTML = `<div class="text-center py-5">🔄 טוען פרקים של ${seriesName}…</div>`;

  const rows = await loadSheet(EPISODES_SHEET_ID, seriesName);
  const eps = rows.filter(ep => ep["שם הפרק"]);

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
}

/****************************************************************
 * 8) הצגת פרקים של עונה
 ****************************************************************/
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

/****************************************************************
 * 9) סינון
 ****************************************************************/
function applyFilters() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  if (isSeriesMode) {
    const filtered = allSeries.filter(s => {
      return [
        s["שם הסדרה בעברית"],
        s["שם הסדרה באנגלית"],
        s["שחקנים ראשיים"],
        s["תיאור קצר"]
      ].some(f => f && f.toLowerCase().includes(q));
    });
    renderSeries(filtered);
    return;
  }

  const y = document.getElementById("yearFilter").value;
  const r = parseFloat(document.getElementById("ratingFilter").value) || 0;
  const g = document.getElementById("genreFilter").value.toLowerCase();
  const p = document.getElementById("pgFilter").value.toLowerCase();

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

/****************************************************************
 * 10) כפתור מעבר
 ****************************************************************/
document.getElementById("toggleViewBtn").addEventListener("click", () => {
  if (isSeriesMode) {
    loadMovies().catch(console.error);
  } else {
    loadSeries().catch(console.error);
  }
});

/****************************************************************
 * 11) התחלה
 ****************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  loadMovies().catch(console.error);
});

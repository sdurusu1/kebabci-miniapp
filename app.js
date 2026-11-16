let allMatches = [];
let currentTab = "all";
let currentLeague = "";
let favorites = JSON.parse(localStorage.getItem("kebabci_fav") || "[]");

const leagues = ["Süper Lig", "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];

async function init() {
  await loadMatches();
  buildLeagueChips();
  setupEvents();
}

async function loadMatches() {
  try {
    const res = await fetch("miniapp_matches.json?t=" + Date.now());
    const json = await res.json();
    allMatches = json.matches || [];
    updateHero();
    render();
  } catch (e) {
    document.getElementById("matchList").innerHTML = '<div class="empty">Veri yüklenemedi</div>';
  }
}

function updateHero() {
  document.getElementById("totalMatches").textContent = allMatches.length;
  const high = allMatches.filter(m => m.pct >= 65).length;
  document.getElementById("highConf").textContent = high;
  const avg = allMatches.length ? Math.round(allMatches.reduce((s,m) => s + (m.pct||0), 0) / allMatches.length) : 0;
  document.getElementById("avgPct").textContent = avg + "%";
}

function buildLeagueChips() {
  const el = document.getElementById("leagueScroll");
  el.innerHTML = `<div class="league-chip active" onclick="setLeague('')">Tümü</div>` +
    leagues.map(l => `<div class="league-chip" onclick="setLeague('${l}')">${l}</div>`).join("");
}

function setLeague(name) {
  currentLeague = name;
  document.querySelectorAll(".league-chip").forEach(c => c.classList.remove("active"));
  event.target.classList.add("active");
  render();
}

function render() {
  let list = [...allMatches];
  const q = document.getElementById("searchInput").value.toLowerCase();

  if (currentTab === "high") list = list.filter(m => m.pct >= 65);
  if (currentTab === "fav") list = list.filter(m => favorites.includes(m.home + m.away));
  if (currentLeague) list = list.filter(m => (m.league || "").includes(currentLeague));
  if (q) list = list.filter(m => (m.home + m.away + m.league + m.score).toLowerCase().includes(q));

  const container = document.getElementById("matchList");
  if (!list.length) {
    container.innerHTML = '<div class="empty">Maç bulunamadı</div>';
    return;
  }

  container.innerHTML = list.map(m => {
    const key = m.home + m.away;
    const isFav = favorites.includes(key);
    const pctClass = m.pct >= 65 ? "pct-high" : m.pct >= 55 ? "pct-mid" : "pct-low";
    return `
      <div class="match-card" onclick="openSheet('${m.home}','${m.away}','${m.score}',${m.pct},'${m.league}','${m.kickoff}')">
        <div class="match-header">
          <div class="teams">${isFav ? "⭐ " : ""}${m.home} – ${m.away}</div>
          <div class="time">${m.kickoff}</div>
        </div>
        <div class="league-name">${m.league}</div>
        <div class="prediction">
          <div class="score">${m.score}</div>
          <div class="pct-badge ${pctClass}">%${m.pct}</div>
        </div>
      </div>
    `;
  }).join("");
}

function openSheet(home, away, score, pct, league, time) {
  const sheet = document.getElementById("bottomSheet");
  document.getElementById("sheetContent").innerHTML = `
    <h2 style="margin:10px 0">${home} – ${away}</h2>
    <p style="color:#888">${league} · ${time}</p>
    <div style="margin:16px 0;font-size:18px">Tahmin: <b>${score}</b></div>
    <div>Güven: <b>%${pct}</b></div>
    <button onclick="toggleFav('${home+away}')" style="width:100%;margin-top:16px;padding:12px;background:#007aff;color:white;border:none;border-radius:12px">
      ${favorites.includes(home+away) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
    </button>
    <button onclick="closeSheet()" style="width:100%;margin-top:8px;padding:12px;background:#333;color:white;border:none;border-radius:12px">Kapat</button>
  `;
  sheet.classList.add("open");
}

function closeSheet() {
  document.getElementById("bottomSheet").classList.remove("open");
}

function toggleFav(key) {
  if (favorites.includes(key)) favorites = favorites.filter(x => x !== key);
  else favorites.push(key);
  localStorage.setItem("kebabci_fav", JSON.stringify(favorites));
  closeSheet();
  render();
}

function setupEvents() {
  document.querySelectorAll(".seg").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".seg").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      render();
    };
  });
  document.getElementById("clearSearch").onclick = () => {
    document.getElementById("searchInput").value = "";
    render();
  };
  document.getElementById("searchInput").oninput = render;
  document.getElementById("bottomSheet").onclick = (e) => {
    if (e.target.id === "bottomSheet") closeSheet();
  };
}

init();

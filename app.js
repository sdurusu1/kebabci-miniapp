const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const statusEl = document.getElementById("status");
const matchesEl = document.getElementById("matches");

let allMatches = [];

async function loadMatches() {
  try {
    statusEl.textContent = "Yükleniyor...";
    const res = await fetch("miniapp_matches.json?t=" + Date.now());
    if (!res.ok) throw new Error();
    const json = await res.json();
    allMatches = json.matches || [];
    render(allMatches);
    statusEl.textContent = allMatches.length ? "" : "Bugün maç yok";
  } catch (e) {
    statusEl.textContent = "Veri yüklenemedi";
  }
}

function render(matches) {
  if (!matches.length) {
    matchesEl.innerHTML = '<div class="empty">Maç bulunamadı</div>';
    return;
  }
  matchesEl.innerHTML = matches.map(m => {
    const cls = m.pct >= 65 ? "high" : m.pct >= 55 ? "mid" : "low";
    return `
      <div class="match">
        <div class="teams">${m.home} – ${m.away}</div>
        <div class="meta">${m.kickoff} · ${m.league}</div>
        <div class="meta">Tahmin: <b>${m.score}</b> · <span class="pct ${cls}">%${m.pct}</span></div>
      </div>
    `;
  }).join("");
}

// Basit lig filtresi
function filterLeague(q) {
  if (!q) return render(allMatches);
  const f = allMatches.filter(m => (m.league || "").toLowerCase().includes(q.toLowerCase()));
  render(f);
}

loadMatches();

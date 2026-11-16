const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const statusEl = document.getElementById("status");
const matchesEl = document.getElementById("matches");

async function loadMatches() {
  try {
    statusEl.textContent = "Maçlar yükleniyor...";
    const data = [
      { home: "Galatasaray", away: "Fenerbahçe", kickoff: "20:00", league: "Süper Lig", score: "2-1", pct: 68 },
      { home: "Real Madrid", away: "Barcelona", kickoff: "22:00", league: "La Liga", score: "1-1", pct: 54 },
      { home: "Manchester City", away: "Liverpool", kickoff: "18:30", league: "Premier League", score: "2-0", pct: 72 }
    ];
    render(data);
    statusEl.textContent = "Örnek veri";
  } catch (e) {
    statusEl.textContent = "Veri yüklenemedi";
  }
}

function render(matches) {
  if (!matches || !matches.length) {
    matchesEl.innerHTML = '<div class="empty">Bugün maç yok</div>';
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

loadMatches();

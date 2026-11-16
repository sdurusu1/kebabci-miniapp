const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const statusEl = document.getElementById("status");
const matchesEl = document.getElementById("matches");

async function loadMatches() {
  try {
    statusEl.textContent = "Maçlar yükleniyor...";
    // Gerçek veri için bot tarafında endpoint gerekir.
    // Şimdilik örnek + açıklama
    const sample = [
      { home: "Galatasaray", away: "Fenerbahçe", kickoff: "20:00", league: "Süper Lig", score: "2-1", pct: 68 },
      { home: "Real Madrid", away: "Barcelona", kickoff: "22:00", league: "La Liga", score: "1-1", pct: 54 }
    ];
    render(sample);
    statusEl.innerHTML = "Örnek veri gösteriliyor.<br><small>Gerçek maçlar için bot endpoint’i eklenecek.</small>";
  } catch (e) {
    statusEl.textContent = "Veri yüklenemedi";
  }
}

function render(matches) {
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

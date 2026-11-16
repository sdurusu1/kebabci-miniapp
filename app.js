const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const statusEl = document.getElementById("status");
const matchesEl = document.getElementById("matches");

async function loadMatches() {
  try {
    statusEl.textContent = "Maçlar yükleniyor...";
    // miniapp_matches.json dosyasını aynı klasöre koyunca çalışır
    const res = await fetch("miniapp_matches.json?t=" + Date.now());
    if (!res.ok) throw new Error("no file");
    const json = await res.json();
    render(json.matches || []);
    statusEl.textContent = "";
  } catch (e) {
    statusEl.textContent = "Veri dosyası bulunamadı";
    matchesEl.innerHTML = '<div class="empty">miniapp_matches.json yüklenmedi</div>';
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

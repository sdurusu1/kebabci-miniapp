const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

let matches = [];
let currentLeague = "";

async function loadData() {
  const list = document.getElementById("list");
  const stats = document.getElementById("stats");
  try {
    stats.textContent = "Yükleniyor...";
    const r = await fetch("miniapp_matches.json?ts=" + Date.now());
    if (!r.ok) throw 0;
    const j = await r.json();
    matches = j.matches || [];
    document.getElementById("sub").textContent = "Abonelik: Aktif";
    applyFilters();
  } catch {
    list.innerHTML = '<div class="empty">Veri dosyası bulunamadı</div>';
    stats.textContent = "";
  }
}

function applyFilters() {
  const q = (document.getElementById("q").value || "").toLowerCase();
  let list = matches;
  if (currentLeague) list = list.filter(m => (m.league || "").includes(currentLeague));
  if (q) list = list.filter(m =>
    (m.home||"").toLowerCase().includes(q) ||
    (m.away||"").toLowerCase().includes(q) ||
    (m.league||"").toLowerCase().includes(q) ||
    (m.score||"").includes(q)
  );
  render(list);
  document.getElementById("stats").textContent = list.length + " maç gösteriliyor";
}

function render(list) {
  const el = document.getElementById("list");
  if (!list.length) {
    el.innerHTML = '<div class="empty">Maç bulunamadı</div>';
    return;
  }
  el.innerHTML = list.map((m, i) => {
    const c = m.pct >= 65 ? "g" : m.pct >= 55 ? "y" : "r";
    return `<div class="card" onclick="openDetail(${i})">
      <div class="teams">${m.home} – ${m.away}</div>
      <div class="info">${m.kickoff} · ${m.league}</div>
      <div class="info"><b>${m.score}</b> · <span class="pct ${c}">%${m.pct}</span></div>
    </div>`;
  }).join("");
}

function setLeague(name) {
  currentLeague = name;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  event.target.classList.add("active");
  applyFilters();
}

function openDetail(i) {
  const m = matches[i];
  if (!m) return;
  const modal = document.getElementById("modal");
  modal.innerHTML = `<div class="modal-content" onclick="event.stopPropagation()">
    <h3>${m.home} – ${m.away}</h3>
    <p style="opacity:.7;margin:6px 0">${m.league} · ${m.kickoff}</p>
    <p>Tahmin: <b>${m.score}</b></p>
    <p>Güven: <b>%${m.pct}</b></p>
    <button style="margin-top:14px;width:100%" onclick="closeModal()">Kapat</button>
  </div>`;
  modal.classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

loadData();

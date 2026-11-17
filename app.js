let matches = [];
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
let notes = JSON.parse(localStorage.getItem("notes") || "{}");
let current = "all";

async function start() {
  const out = document.getElementById("out");
  out.innerHTML = "Yükleniyor...";
  try {
    const res = await fetch("miniapp_matches.json?x=" + Date.now());
    if (!res.ok) throw new Error();
    const data = await res.json();
    matches = data.matches || [];
    if (!matches.length) { out.innerHTML = "Maç yok"; return; }
    fill();
    show();
  } catch {
    out.innerHTML = "Veri yüklenemedi";
  }
}

function fill() {
  const days = [...new Set(matches.map(m => m.date || "bugün"))].sort();
  const leagues = [...new Set(matches.map(m => m.league).filter(Boolean))].sort();
  document.getElementById("day").innerHTML = days.map(d => `<option value="${d}">${d}</option>`).join("");
  document.getElementById("league").innerHTML = `<option value="">Tüm Ligler</option>` + leagues.map(l => `<option value="${l}">${l}</option>`).join("");
}

function show() {
  const day = document.getElementById("day").value;
  const lg = document.getElementById("league").value;
  const q = (document.getElementById("search").value || "").toLowerCase();
  let list = matches.filter(m => (m.date || "bugün") === day);
  if (lg) list = list.filter(m => m.league === lg);
  if (current === "high") list = list.filter(m => (m.pct || 0) >= 65);
  if (current === "fav") list = list.filter(m => favs.includes((m.home||"")+"|"+(m.away||"")));
  if (q) list = list.filter(m => ((m.home||"")+(m.away||"")).toLowerCase().includes(q));

  const box = document.getElementById("out");
  if (!list.length) { box.innerHTML = "<p>Maç yok</p>"; return; }
  box.innerHTML = list.map((m, idx) => {
    const key = (m.home||"") + "|" + (m.away||"");
    const star = favs.includes(key) ? "⭐ " : "";
    const cls = (m.pct||0) >= 65 ? "high" : (m.pct||0) >= 55 ? "mid" : "low";
    return `<div class="card" onclick="openDetail(${idx})">
      <b>${star}${m.home} – ${m.away}</b><br>
      <span class="small">${m.league||""} · ${m.kickoff||""}</span><br>
      <span class="score ${cls}">${m.score||"-"}</span> <span class="small">(%${m.pct||"?"})</span>
    </div>`;
  }).join("");
  // store current list for detail
  window._currentList = list;
}

function openDetail(idx) {
  const m = (window._currentList || [])[idx];
  if (!m) return;
  const p = m.pct || 0;
  const cls = p >= 65 ? "high" : p >= 55 ? "mid" : "low";
  const key = (m.home||"") + "|" + (m.away||"");
  document.getElementById("panel").innerHTML = `
    <h3>${m.home} – ${m.away}</h3>
    <p class="small">${m.league||""} · ${m.kickoff||""}</p>
    <p style="font-size:20px"><b class="${cls}">${m.score||"-"}</b> (%${p})</p>
    <p class="small">Güven: <b>${p>=65?"Yüksek":p>=55?"Orta":"Düşük"}</b></p>
    ${m.xg_home ? `<p class="small">xG: ${m.xg_home} - ${m.xg_away||"?"}</p>` : ""}
    ${m.form_home ? `<p class="small">Form: ${m.form_home} / ${m.form_away||"?"}</p>` : ""}
    ${m.iy ? `<p class="small">İY: ${m.iy}</p>` : ""}
    <p class="small" style="margin-top:8px">${p>=65?"Model bu skoru yüksek güvenle öngörüyor.":p>=55?"Orta güven. Dikkatli olun.":"Düşük güven."}</p>
    <button onclick="closeModal()" style="margin-top:12px">Kapat</button>
  `;
  document.getElementById("modal").classList.add("show");
}

function closeModal() { document.getElementById("modal").classList.remove("show"); }
function filter(t) { current = t; show(); }

document.getElementById("day").onchange = show;
document.getElementById("league").onchange = show;
document.getElementById("search").oninput = show;
start();

let all = [];
let mode = "all";
let favs = JSON.parse(localStorage.getItem("fav") || "[]");
let notes = JSON.parse(localStorage.getItem("notes") || "{}");

async function load() {
  try {
    const r = await fetch("miniapp_matches.json?" + Date.now());
    const j = await r.json();
    all = j.matches || [];
    // Tarih yoksa bugünü kullan
    all.forEach(m => { if (!m.date) m.date = "bugün"; });
    const dates = [...new Set(all.map(m => m.date))].filter(Boolean);
    const leagues = [...new Set(all.map(m => m.league))].filter(Boolean);
    const ds = document.getElementById("dateSel");
    const ls = document.getElementById("leagueSel");
    ds.innerHTML = dates.map(d => `<option value="${d}">${d}</option>`).join("") || "<option>bugün</option>";
    ls.innerHTML = `<option value="">Tüm Ligler</option>` + leagues.map(l => `<option value="${l}">${l}</option>`).join("");
    draw();
  } catch (e) {
    document.getElementById("list").innerHTML = "Veri yüklenemedi";
  }
}

function draw() {
  const date = document.getElementById("dateSel").value;
  const league = document.getElementById("leagueSel").value;
  const q = (document.getElementById("q").value || "").toLowerCase();
  let list = all.filter(m => !date || m.date === date);
  if (league) list = list.filter(m => m.league === league);
  if (mode === "high") list = list.filter(m => (m.pct || 0) >= 65);
  if (mode === "fav") list = list.filter(m => favs.includes((m.home||"")+(m.away||"")));
  if (q) list = list.filter(m => ((m.home||"")+(m.away||"")).toLowerCase().includes(q));

  const box = document.getElementById("list");
  if (!list.length) { box.innerHTML = "Maç yok"; return; }
  box.innerHTML = list.map(m => {
    const k = (m.home||"")+(m.away||"");
    const star = favs.includes(k) ? "⭐" : "☆";
    return `<div class="card">
      <b>${star} ${m.home} – ${m.away}</b><br>
      <span class="small">${m.league||""} · ${m.kickoff||""} · ${m.score||"-"} (%${m.pct||"?"})</span>
      <div style="margin-top:6px">
        <button onclick="toggleFav('${k}')">Favori</button>
        <button onclick="editNote('${k}')">Not</button>
      </div>
    </div>`;
  }).join("");
}

function setMode(m) { mode = m; draw(); }
function toggleFav(k) {
  favs = favs.includes(k) ? favs.filter(x => x !== k) : [...favs, k];
  localStorage.setItem("fav", JSON.stringify(favs));
  draw();
}
function editNote(k) {
  const v = prompt("Not", notes[k] || "");
  if (v === null) return;
  if (v) notes[k] = v; else delete notes[k];
  localStorage.setItem("notes", JSON.stringify(notes));
  draw();
}

document.getElementById("dateSel").onchange = draw;
document.getElementById("leagueSel").onchange = draw;
document.getElementById("q").oninput = draw;
load();

let all = [];
let mode = "all";
let sortAsc = false;
let favs = JSON.parse(localStorage.getItem("fav") || "[]");
let notes = JSON.parse(localStorage.getItem("notes") || "{}");

async function load() {
  const r = await fetch("miniapp_matches.json?" + Date.now());
  all = (await r.json()).matches || [];
  const dates = [...new Set(all.map(m => m.date))].sort();
  const leagues = [...new Set(all.map(m => m.league))].sort();
  document.getElementById("dateSel").innerHTML = dates.map(d => `<option>${d}</option>`).join("");
  document.getElementById("leagueSel").innerHTML = `<option value="">Tüm Ligler</option>` + leagues.map(l => `<option>${l}</option>`).join("");
  draw();
}

function draw() {
  const date = document.getElementById("dateSel").value;
  const league = document.getElementById("leagueSel").value;
  const q = document.getElementById("q").value.toLowerCase();
  let list = all.filter(m => m.date === date);
  if (league) list = list.filter(m => m.league === league);
  if (mode === "high") list = list.filter(m => m.pct >= 65);
  if (mode === "fav") list = list.filter(m => favs.includes(m.home + m.away));
  if (q) list = list.filter(m => (m.home + m.away).toLowerCase().includes(q));
  list.sort((a,b) => sortAsc ? a.pct - b.pct : b.pct - a.pct);

  document.getElementById("list").innerHTML = list.map(m => {
    const k = m.home + m.away;
    const star = favs.includes(k) ? "⭐" : "☆";
    const n = notes[k] ? `<div class="small">📝 ${notes[k]}</div>` : "";
    return `<div class="card">
      <b>${star} ${m.home} – ${m.away}</b><br>
      <span class="small">${m.league} · ${m.kickoff} · ${m.score} (%${m.pct})</span>
      ${n}
      <div>
        <button onclick="toggleFav('${k}')">Favori</button>
        <button onclick="editNote('${k}')">Not</button>
        <button onclick="copyText('${m.home} - ${m.away}\\n${m.score} (%${m.pct})')">Kopyala</button>
      </div>
    </div>`;
  }).join("") || "Maç yok";
}

function setMode(m) { mode = m; draw(); }
function sortMode() { sortAsc = !sortAsc; draw(); }
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
function copyText(t) {
  navigator.clipboard.writeText(t).then(() => alert("Kopyalandı"));
}

document.getElementById("dateSel").onchange = draw;
document.getElementById("leagueSel").onchange = draw;
document.getElementById("q").oninput = draw;
load();

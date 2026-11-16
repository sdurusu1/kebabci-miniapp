let matches = [];
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
let current = "all";

async function start() {
  try {
    const res = await fetch("miniapp_matches.json?x=" + Date.now());
    const data = await res.json();
    matches = data.matches || [];
    fill();
    show();
  } catch (e) {
    document.getElementById("out").innerHTML = "Veri yüklenemedi";
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
  const q = document.getElementById("search").value.toLowerCase();
  let list = matches.filter(m => (m.date || "bugün") === day);
  if (lg) list = list.filter(m => m.league === lg);
  if (current === "high") list = list.filter(m => (m.pct||0) >= 65);
  if (current === "fav") list = list.filter(m => favs.includes(m.home+m.away));
  if (q) list = list.filter(m => (m.home+" "+m.away).toLowerCase().includes(q));

  const box = document.getElementById("out");
  if (!list.length) { box.innerHTML = "<p>Maç yok</p>"; return; }
  box.innerHTML = list.map(m => {
    const key = m.home + m.away;
    const star = favs.includes(key) ? "⭐ " : "";
    return `<div class="card">
      <b>${star}${m.home} – ${m.away}</b><br>
      <span class="small">${m.league} · ${m.kickoff}</span><br>
      <span class="score">${m.score}</span> <span class="small">(%${m.pct})</span><br>
      <button onclick="toggle('${key}')" style="margin-top:6px;font-size:12px">Favori</button>
    </div>`;
  }).join("");
}

function filter(t) { current = t; show(); }
function toggle(key) {
  favs = favs.includes(key) ? favs.filter(x => x !== key) : [...favs, key];
  localStorage.setItem("favs", JSON.stringify(favs));
  show();
}

document.getElementById("day").onchange = show;
document.getElementById("league").onchange = show;
document.getElementById("search").oninput = show;
start();

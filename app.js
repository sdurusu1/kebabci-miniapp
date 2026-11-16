let matches = [];
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
let notes = JSON.parse(localStorage.getItem("notes") || "{}");
let current = "all";
let sortDesc = true;

async function start() {
  try {
    const res = await fetch("miniapp_matches.json?x=" + Date.now());
    matches = (await res.json()).matches || [];
    fill();
    show();
  } catch {
    document.getElementById("out").innerHTML = "<p class='small'>Veri yüklenemedi</p>";
  }
}

function fill() {
  const days = [...new Set(matches.map(m => m.date || "bugün"))].sort();
  const leagues = [...new Set(matches.map(m => m.league).filter(Boolean))].sort();
  document.getElementById("day").innerHTML = days.map(d => `<option>${d}</option>`).join("");
  document.getElementById("league").innerHTML = `<option value="">Tüm Ligler</option>` + leagues.map(l => `<option>${l}</option>`).join("");
}

function show() {
  const day = document.getElementById("day").value;
  const lg = document.getElementById("league").value;
  const q = document.getElementById("search").value.toLowerCase();
  let list = matches.filter(m => (m.date || "bugün") === day);
  if (lg) list = list.filter(m => m.league === lg);
  if (current === "high") list = list.filter(m => (m.pct||0) >= 65);
  if (current === "fav") list = list.filter(m => favs.includes(m.home+"|"+m.away));
  if (q) list = list.filter(m => (m.home+" "+m.away).toLowerCase().includes(q));
  list.sort((a,b) => sortDesc ? (b.pct||0)-(a.pct||0) : (a.pct||0)-(b.pct||0));

  const box = document.getElementById("out");
  if (!list.length) { box.innerHTML = "<p class='small'>Bu filtrede maç yok</p>"; return; }
  box.innerHTML = list.map(m => {
    const key = m.home + "|" + m.away;
    const star = favs.includes(key) ? "⭐ " : "";
    const cls = (m.pct||0) >= 65 ? "high" : (m.pct||0) >= 55 ? "mid" : "low";
    const n = notes[key] ? `<div class="small">📝 ${notes[key]}</div>` : "";
    return `<div class="card" onclick="openDetail(this)" data-home="${m.home}" data-away="${m.away}" data-score="${m.score}" data-pct="${m.pct}" data-league="${m.league}" data-time="${m.kickoff}" data-key="${key}">
      <b>${star}${m.home} – ${m.away}</b><br>
      <span class="small">${m.league} · ${m.kickoff}</span><br>
      <span class="score ${cls}">${m.score}</span> <span class="small">(%${m.pct})</span>
      ${n}
    </div>`;
  }).join("");
}

function openDetail(el) {
  const home = el.dataset.home;
  const away = el.dataset.away;
  const score = el.dataset.score;
  const pct = el.dataset.pct;
  const league = el.dataset.league;
  const time = el.dataset.time;
  const key = el.dataset.key;
  const cls = pct >= 65 ? "high" : pct >= 55 ? "mid" : "low";
  document.getElementById("panel").innerHTML = `
    <h3>${home} – ${away}</h3>
    <p class="small">${league} · ${time}</p>
    <p style="font-size:20px;margin:12px 0"><b class="${cls}">${score}</b></p>
    <p>Güven: <b>%${pct}</b></p>
    <hr style="border-color:#333;margin:12px 0">
    <p class="small"><b>Kısa Analiz</b><br>
    • Tahmin güveni: %${pct}<br>
    • Lig: ${league}<br>
    • Saat: ${time}<br>
    • Not: ${notes[key] || "Yok"}</p>
    <div style="margin-top:14px;display:flex;gap:6px;flex-wrap:wrap">
      <button onclick="toggleFav('${key}')">Favori</button>
      <button onclick="editNote('${key}')">Not Ekle</button>
      <button onclick="copyMatch('${home}','${away}','${score}',${pct})">Kopyala</button>
      <button onclick="closeModal()">Kapat</button>
    </div>
  `;
  document.getElementById("modal").classList.add("show");
}

function closeModal() { document.getElementById("modal").classList.remove("show"); }
function filter(t) { current = t; show(); }
function sortToggle() { sortDesc = !sortDesc; show(); }
function toggleFav(key) {
  favs = favs.includes(key) ? favs.filter(x => x !== key) : [...favs, key];
  localStorage.setItem("favs", JSON.stringify(favs));
  closeModal(); show();
}
function editNote(key) {
  const v = prompt("Not yaz", notes[key] || "");
  if (v === null) return;
  if (v.trim()) notes[key] = v.trim(); else delete notes[key];
  localStorage.setItem("notes", JSON.stringify(notes));
  closeModal(); show();
}
function copyMatch(h,a,s,p) {
  const text = h + " - " + a + "\\nTahmin: " + s + " (%" + p + ")\\nKEBABCI";
  navigator.clipboard.writeText(text).then(() => alert("Kopyalandı"));
}

document.getElementById("day").onchange = show;
document.getElementById("league").onchange = show;
document.getElementById("search").oninput = show;
start();

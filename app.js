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
    return `<div class="card" onclick="openDetail(this)" 
      data-home="${esc(m.home)}" data-away="${esc(m.away)}" 
      data-score="${m.score}" data-pct="${m.pct}" 
      data-league="${esc(m.league)}" data-time="${m.kickoff}" data-key="${key}">
      <b>${star}${m.home} – ${m.away}</b><br>
      <span class="small">${m.league} · ${m.kickoff}</span><br>
      <span class="score ${cls}">${m.score}</span> <span class="small">(%${m.pct})</span>
      ${n}
    </div>`;
  }).join("");
}

function esc(s) { return (s||"").replace(/"/g,"""); }

function openDetail(el) {
  const d = el.dataset;
  const pct = parseInt(d.pct) || 0;
  const cls = pct >= 65 ? "high" : pct >= 55 ? "mid" : "low";
  const key = d.key;
  document.getElementById("panel").innerHTML = `
    <h3 style="margin-top:0">${d.home} – ${d.away}</h3>
    <p class="small">${d.league} · ${d.time}</p>
    <div style="font-size:22px;margin:10px 0"><b class="${cls}">${d.score}</b></div>
    <p>Güven skoru: <b class="${cls}">%${pct}</b></p>
    <hr style="border:0;border-top:1px solid #333;margin:12px 0">
    <p><b>Kısa Analiz</b></p>
    <ul class="small" style="padding-left:18px;line-height:1.5">
      <li>Tahmin güveni ${pct >= 65 ? "yüksek" : pct >= 55 ? "orta" : "düşük"} seviyede.</li>
      <li>Lig: ${d.league}</li>
      <li>Başlama: ${d.time}</li>
      <li>Kişisel not: ${notes[key] || "Yok"}</li>
    </ul>
    <p class="small" style="margin-top:8px">Detaylı xG, form ve H2H analizi bot tarafında mevcut. Mini App’e daha fazla veri eklenebilir.</p>
    <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px">
      <button onclick="toggleFav('${key}')">${favs.includes(key)?"Favoriden Çıkar":"Favoriye Ekle"}</button>
      <button onclick="editNote('${key}')">Not</button>
      <button onclick="copyMatch('${d.home}','${d.away}','${d.score}',${pct})">Kopyala</button>
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
  const v = prompt("Not", notes[key] || "");
  if (v === null) return;
  if (v.trim()) notes[key] = v.trim(); else delete notes[key];
  localStorage.setItem("notes", JSON.stringify(notes));
  closeModal(); show();
}
function copyMatch(h,a,s,p) {
  navigator.clipboard.writeText(h+" - "+a+"\\n"+s+" (%"+p+")\\nKEBABCI İstatistik").then(()=>alert("Kopyalandı"));
}

document.getElementById("day").onchange = show;
document.getElementById("league").onchange = show;
document.getElementById("search").oninput = show;
start();

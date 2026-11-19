let matches = [];
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
let notes = JSON.parse(localStorage.getItem("notes") || "{}");
let current = "all";
let compact = false;

async function start() {
  const out = document.getElementById("out");
  out.innerHTML = "Yükleniyor...";
  try {
    const res = await fetch("miniapp_matches.json?x=" + Date.now());
    matches = (await res.json()).matches || [];
    fill();
    show();
  } catch {
    out.innerHTML = "Veri yüklenemedi";
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
  const q = (document.getElementById("search").value || "").toLowerCase();
  let list = matches.filter(m => (m.date || "bugün") === day);
  if (lg) list = list.filter(m => m.league === lg);
  if (current === "high") list = list.filter(m => (m.pct||0) >= 65);
  if (current === "fav") list = list.filter(m => favs.includes((m.home||"")+"|"+(m.away||"")));
  if (current === "top5") list = list.filter(m => (m.pct||0) >= 60).sort((a,b)=>(b.pct||0)-(a.pct||0)).slice(0,5);
  if (current === "home") list = list.filter(m => (m.score||"").startsWith("1") || (m.score||"").startsWith("2"));
  if (current === "away") list = list.filter(m => (m.score||"").endsWith("1") || (m.score||"").endsWith("2"));
  if (q) list = list.filter(m => ((m.home||"")+(m.away||"")).toLowerCase().includes(q));

  document.getElementById("count").textContent = list.length + " maç";
  const box = document.getElementById("out");
  if (!list.length) { box.innerHTML = "<p class='small'>Maç yok</p>"; return; }
  window._list = list;
  box.innerHTML = list.map((m, i) => {
    const key = (m.home||"")+"|"+(m.away||"");
    const star = favs.includes(key) ? "⭐ " : "";
    const cls = (m.pct||0)>=65?"high":(m.pct||0)>=55?"mid":"low";
    const note = notes[key] ? `<div class="small">📝 ${notes[key]}</div>` : "";
    if (compact) {
      return `<div class="card" onclick="openDetail(${i})" style="padding:8px">
        <b>${star}${m.home} – ${m.away}</b> · <span class="${cls}">${m.score}</span>
      </div>`;
    }
    return `<div class="card" onclick="openDetail(${i})">
      <b>${star}${m.home} – ${m.away}</b><br>
      <span class="small">${m.league||""} · ${m.kickoff||""}</span><br>
      <span class="score ${cls}">${m.score||"-"}</span> <span class="small">(%${m.pct||"?"})</span>
      ${note}
    </div>`;
  }).join("");
}

function openDetail(i) {
  const m = (window._list || [])[i];
  if (!m) return;
  const p = m.pct || 0;
  const cls = p>=65?"high":p>=55?"mid":"low";
  const key = (m.home||"")+"|"+(m.away||"");
  document.getElementById("panel").innerHTML = `
    <h3>${m.home} – ${m.away}</h3>
    <p class="small">${m.league||""} · ${m.kickoff||""}</p>
    <p style="font-size:22px;margin:8px 0"><b class="${cls}">${m.score||"-"}</b></p>
    <p>Güven: <b class="${cls}">%${p}</b> (${p>=65?"Yüksek":p>=55?"Orta":"Düşük"})</p>
    ${m.xg_home?`<p class="small">xG: ${m.xg_home} - ${m.xg_away||"?"}</p>`:""}
    ${m.form_home?`<p class="small">Form: ${m.form_home} / ${m.form_away||"?"}</p>`:""}
    ${m.iy?`<p class="small">İY: ${m.iy}</p>`:""}
    <p class="small" style="margin-top:8px">
      ${p>=65?"Model bu sonucu yüksek güvenle öngörüyor.":p>=55?"Orta seviye güven. Sürpriz olabilir.":"Düşük güven, belirsizlik yüksek."}
    </p>
    ${notes[key]?`<p class="small">Notun: ${notes[key]}</p>`:""}
    <div style="margin-top:12px">
      <button onclick="togFav('${key}')">${favs.includes(key)?"Favoriden Çık":"Favoriye Ekle"}</button>
      <button onclick="editNote('${key}')">Not</button>
      <button onclick="copyM('${m.home}','${m.away}','${m.score}',${p})">Kopyala</button>
      <button onclick="closeModal()">Kapat</button>
    </div>
  `;
  document.getElementById("modal").classList.add("show");
}

function closeModal(){ document.getElementById("modal").classList.remove("show"); }
function filter(t){ current=t; show(); }
function toggleView(){ compact=!compact; show(); }
function sortTime(){
  const day=document.getElementById("day").value;
  let list=matches.filter(m=>(m.date||"bugün")===day);
  list.sort((a,b)=>(a.kickoff||"").localeCompare(b.kickoff||""));
  window._list=list;
  document.getElementById("count").textContent=list.length+" maç (saat)";
  document.getElementById("out").innerHTML=list.map((m,i)=>`<div class="card" onclick="openDetail(${i})"><b>${m.home} – ${m.away}</b><br><span class="small">${m.kickoff}</span></div>`).join("");
}
function togFav(k){
  favs=favs.includes(k)?favs.filter(x=>x!==k):[...favs,k];
  localStorage.setItem("favs",JSON.stringify(favs));
  closeModal(); show();
}
function editNote(k){
  const v=prompt("Not",notes[k]||"");
  if(v===null)return;
  if(v.trim())notes[k]=v.trim(); else delete notes[k];
  localStorage.setItem("notes",JSON.stringify(notes));
  closeModal(); show();
}
function copyM(h,a,s,p){
  navigator.clipboard.writeText(h+" - "+a+"\\n"+s+" (%"+p+")\\nKEBABCI").then(()=>alert("Kopyalandı"));
}

document.getElementById("day").onchange=show;
document.getElementById("league").onchange=show;
document.getElementById("search").oninput=show;
start();

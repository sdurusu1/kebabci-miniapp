let matches = [];
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
let notes = JSON.parse(localStorage.getItem("notes") || "{}");
let current = "all";

async function start() {
  const out = document.getElementById("out");
  out.innerHTML = "Yükleniyor...";
  try {
    const res = await fetch("miniapp_matches.json?x=" + Date.now());
    if (!res.ok) throw new Error("dosya yok");
    const data = await res.json();
    matches = data.matches || [];
    if (!matches.length) {
      out.innerHTML = "miniapp_matches.json boş veya hatalı";
      return;
    }
    fill();
    show();
  } catch (e) {
    out.innerHTML = "Veri yüklenemedi. GitHub'da miniapp_matches.json var mı kontrol et.";
  }
}

function fill() {
  const days = [...new Set(matches.map(m => m.date || "bugün"))].sort();
  const leagues = [...new Set(matches.map(m => m.league).filter(Boolean))].sort();
  const daySel = document.getElementById("day");
  const lgSel = document.getElementById("league");
  daySel.innerHTML = days.map(d => `<option value="${d}">${d}</option>`).join("");
  lgSel.innerHTML = `<option value="">Tüm Ligler</option>` + leagues.map(l => `<option value="${l}">${l}</option>`).join("");
}

function show() {
  const day = document.getElementById("day").value;
  const lg = document.getElementById("league").value;
  const q = (document.getElementById("search").value || "").toLowerCase();
  let list = matches.filter(m => (m.date || "bugün") === day);
  if (lg) list = list.filter(m => m.league === lg);
  if (current === "high") list = list.filter(m => (m.pct || 0) >= 65);
  if (current === "fav") list = list.filter(m => favs.includes(m.home + "|" + m.away));
  if (q) list = list.filter(m => ((m.home || "") + (m.away || "")).toLowerCase().includes(q));

  const box = document.getElementById("out");
  if (!list.length) {
    box.innerHTML = "<p>Bu filtrede maç yok</p>";
    return;
  }
  box.innerHTML = list.map(m => {
    const key = (m.home || "") + "|" + (m.away || "");
    const star = favs.includes(key) ? "⭐ " : "";
    const cls = (m.pct || 0) >= 65 ? "high" : (m.pct || 0) >= 55 ? "mid" : "low";
    return `<div class="card" onclick="openDetail('${esc(m.home)}','${esc(m.away)}','${m.score||"-"}','${m.pct||0}','${esc(m.league)}','${m.kickoff||""}','${key}')">
      <b>${star}${m.home} – ${m.away}</b><br>
      <span class="small">${m.league || ""} · ${m.kickoff || ""}</span><br>
      <span class="score ${cls}">${m.score || "-"}</span> <span class="small">(%${m.pct || "?"})</span>
    </div>`;
  }).join("");
}

function esc(s) { return String(s || "").replace(/'/g, ""); }

function openDetail(home, away, score, pct, league, time, key) {
  const p = parseInt(pct) || 0;
  const cls = p >= 65 ? "high" : p >= 55 ? "mid" : "low";
  document.getElementById("panel").innerHTML = `
    <h3>${home} – ${away}</h3>
    <p class="small">${league} · ${time}</p>
    <p style="font-size:20px"><b class="${cls}">${score}</b> (%${p})</p>
    <p class="small">Güven: ${p >= 65 ? "Yüksek" : p >= 55 ? "Orta" : "Düşük"}</p>
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

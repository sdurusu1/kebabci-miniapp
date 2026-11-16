let data = [];
let sortDesc = true;

async function reload() {
  const box = document.getElementById("matches");
  try {
    document.getElementById("summary").textContent = "Yükleniyor...";
    const r = await fetch("miniapp_matches.json?" + Date.now());
    data = (await r.json()).matches || [];
    document.getElementById("subStatus").textContent = "Aktif";
    filter();
  } catch {
    box.innerHTML = '<div class="empty">Veri yüklenemedi</div>';
  }
}

function filter() {
  const q = document.getElementById("search").value.toLowerCase();
  let list = data.filter(m =>
    !q || (m.home+m.away+m.league+m.score).toLowerCase().includes(q)
  );
  if (sortDesc) list.sort((a,b)=> (b.pct||0)-(a.pct||0));
  render(list);
  document.getElementById("summary").textContent = list.length + " maç";
}

function render(list) {
  const box = document.getElementById("matches");
  if (!list.length) {
    box.innerHTML = '<div class="empty">Sonuç yok</div>';
    return;
  }
  box.innerHTML = list.map(m => {
    const c = m.pct>=65?"high":m.pct>=55?"mid":"low";
    return `<div class="card" onclick="openSheet('${m.home}','${m.away}','${m.score}',${m.pct},'${m.league}','${m.kickoff}')">
      <div class="teams">${m.home} – ${m.away}</div>
      <div class="meta">${m.kickoff} · ${m.league}</div>
      <div class="meta"><b>${m.score}</b> · <span class="${c}">%${m.pct}</span></div>
    </div>`;
  }).join("");
}

function quick(term) {
  document.getElementById("search").value = term === "high" ? "" : term;
  if (term === "high") data = data.filter(m => m.pct >= 65);
  filter();
}

function clearAll() {
  document.getElementById("search").value = "";
  reload();
}

function toggleSort() {
  sortDesc = !sortDesc;
  filter();
}

function openSheet(h,a,s,p,l,k) {
  const sh = document.getElementById("sheet");
  sh.querySelector(".sheet-body").innerHTML = `
    <h3>${h} – ${a}</h3>
    <p style="opacity:.7">${l} · ${k}</p>
    <p style="margin:10px 0">Tahmin: <b>${s}</b></p>
    <p>Güven: <b>%${p}</b></p>
    <button style="width:100%;margin-top:12px" onclick="closeSheet()">Kapat</button>
  `;
  sh.classList.add("open");
}

function closeSheet() {
  document.getElementById("sheet").classList.remove("open");
}

reload();

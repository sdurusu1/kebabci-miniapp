let matches=[], favs=JSON.parse(localStorage.favs||"[]"), notes=JSON.parse(localStorage.notes||"{}"), current="all";

async function start(){
  document.getElementById("out").innerHTML="Yükleniyor...";
  try{
    const r=await fetch("miniapp_matches.json?x="+Date.now());
    matches=(await r.json()).matches||[];
    fill(); show();
  }catch{document.getElementById("out").innerHTML="Veri yok";}
}

function fill(){
  const days=[...new Set(matches.map(m=>m.date||"bugün"))].sort();
  const leagues=[...new Set(matches.map(m=>m.league).filter(Boolean))].sort();
  document.getElementById("day").innerHTML=days.map(d=>`<option>${d}</option>`).join("");
  document.getElementById("league").innerHTML=`<option value="">Tüm Ligler</option>`+leagues.map(l=>`<option>${l}</option>`).join("");
}

function show(){
  const day=document.getElementById("day").value;
  const lg=document.getElementById("league").value;
  const q=(document.getElementById("search").value||"").toLowerCase();
  let list=matches.filter(m=>(m.date||"bugün")===day);
  if(lg) list=list.filter(m=>m.league===lg);
  if(current==="high") list=list.filter(m=>(m.pct||0)>=65);
  if(current==="top3") list=list.filter(m=>(m.pct||0)>=60).sort((a,b)=>(b.pct||0)-(a.pct||0)).slice(0,3);
  if(current==="surprise") list=list.filter(m=>(m.pct||0)<50);
  if(current==="over") list=list.filter(m=>((m.score||"").split("-").reduce((a,b)=>+a+(+b),0)>=3));
  if(current==="btts") list=list.filter(m=>{const p=(m.score||"0-0").split("-"); return +p[0]>0 && +p[1]>0;});
  if(current==="low") list=list.filter(m=>((m.score||"").split("-").reduce((a,b)=>+a+(+b),0)<=2));
  if(current==="fav") list=list.filter(m=>favs.includes((m.home||"")+"|"+(m.away||"")));
  if(q) list=list.filter(m=>((m.home||"")+(m.away||"")).toLowerCase().includes(q));

  const high=list.filter(m=>(m.pct||0)>=65).length;
  const avg=list.length?Math.round(list.reduce((s,m)=>s+(m.pct||0),0)/list.length):0;
  document.getElementById("summary").innerHTML=`<b>${list.length}</b> maç · <b>${high}</b> yüksek güven · Ort. <b>%${avg}</b>`;
  document.getElementById("count").textContent=list.length+" maç gösteriliyor";

  const box=document.getElementById("out");
  if(!list.length){box.innerHTML="<p class='small'>Maç yok</p>";return;}
  window._list=list;
  box.innerHTML=list.map((m,i)=>{
    const key=(m.home||"")+"|"+(m.away||"");
    const star=favs.includes(key)?"⭐ ":"";
    const cls=(m.pct||0)>=65?"high":(m.pct||0)>=55?"mid":"low";
    const risk=(m.pct||0)>=65?"Düşük Risk":(m.pct||0)>=50?"Orta":"Yüksek Risk";
    return `<div class="card" onclick="openDetail(${i})">
      <b>${star}${m.home} – ${m.away}</b> <span class="risk ${cls}">${risk}</span><br>
      <span class="small">${m.league||""} · ${m.kickoff||""}</span><br>
      <span class="score ${cls}">${m.score||"-"}</span> <span class="small">(%${m.pct||"?"})</span>
    </div>`;
  }).join("");
}

function openDetail(i){
  const m=(window._list||[])[i]; if(!m)return;
  const p=m.pct||0, cls=p>=65?"high":p>=55?"mid":"low";
  const key=(m.home||"")+"|"+(m.away||"");
  const goals=(m.score||"0-0").split("-").reduce((a,b)=>+a+(+b),0);
  document.getElementById("panel").innerHTML=`
    <h3>${m.home} – ${m.away}</h3>
    <p class="small">${m.league||""} · ${m.kickoff||""}</p>
    <p style="font-size:22px"><b class="${cls}">${m.score||"-"}</b> (%${p})</p>
    <p>Risk: <b class="${cls}">${p>=65?"Düşük":p>=50?"Orta":"Yüksek"}</b></p>
    ${m.xg_home?`<p class="small">xG: ${m.xg_home}-${m.xg_away||"?"}</p>`:""}
    ${m.form_home?`<p class="small">Form Ev: ${m.form_home}<br>Form Dep: ${m.form_away||"?"}</p>`:""}
    ${oddsBlock(m)}
    <p><b>Neden bu skor?</b></p>
    <ul class="small">
      <li>Güven skoru %${p}</li>
      <li>Beklenen gol sayısı yaklaşık ${goals}</li>
      <li>${p>=65?"Model net bir kenar görüyor":"Belirsizlik mevcut"}</li>
    </ul>
    <p class="small">${p<50?"Bu maç neden riskli? Düşük güven, sürpriz ihtimali yüksek.":""}</p>
    <div style="margin-top:12px">
      <button onclick="togFav('${key}')">Favori</button>
      <button onclick="copyNice('${m.home}','${m.away}','${m.score}',${p})">Paylaş</button>
      <button onclick="closeModal()">Kapat</button>
    </div>`;
  document.getElementById("modal").classList.add("show");
}

function closeModal(){document.getElementById("modal").classList.remove("show");}
function filter(t){current=t;show();}
function togFav(k){favs=favs.includes(k)?favs.filter(x=>x!==k):[...favs,k];localStorage.favs=JSON.stringify(favs);closeModal();show();}
function copyNice(h,a,s,p){
  const t=`⚽ ${h} - ${a}\\n🎯 ${s} (%${p})\\n📊 KEBABCI İstatistik`;
  navigator.clipboard.writeText(t).then(()=>alert("Kopyalandı"));
}
document.getElementById("day").onchange=show;
document.getElementById("league").onchange=show;
document.getElementById("search").oninput=show;
start();

function oddsBlock(m) {
  const o = m.odds || {};
  if (!Object.keys(o).length) return "";
  let html = "<p><b>Pazarlar</b></p><div class='small'>";
  const map = {
    "1": "MS 1", "X": "MS X", "2": "MS 2",
    "over25": "2.5 Üst", "under25": "2.5 Alt",
    "over15": "1.5 Üst", "under15": "1.5 Alt",
    "over35": "3.5 Üst", "under35": "3.5 Alt",
    "btts_yes": "KG Var", "btts_no": "KG Yok",
    "dc_1x": "Çifte Şans 1X", "dc_12": "Çifte Şans 12", "dc_x2": "Çifte Şans X2",
    "ht_over05": "İY 0.5 Üst", "ht_under05": "İY 0.5 Alt",
    "corners_over95": "Korner 9.5 Üst", "cards_over35": "Kart 3.5 Üst"
  };
  for (const [k, label] of Object.entries(map)) {
    if (o[k]) html += label + ": <b>" + o[k] + "</b><br>";
  }
  html += "</div>";
  return html;
}

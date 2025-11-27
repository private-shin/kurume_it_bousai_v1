// シンプルな推奨ルールを実装した計算スクリプト（登録機能は削除済み）

const DEFAULT_CFG = {
  waterPerDay: { infant:1.5, child:2.5, adult:3, elderly:3 }, // L/日
  foodMealsPerDay: 3, // 食数/人・日
  diapersPerInfantPerDay: 8,
  formulaLitersPerInfantPerDay: 0.8,
  blanketsPerPerson: 1,
  flashlightPerPeople: 2, // 何人に1個
  masksPerPersonPerDay: 2,
  toiletBagsPerPersonPerDay: 2
};

const cfg = JSON.parse(JSON.stringify(DEFAULT_CFG));

function q(n){ return Math.max(0, Math.round(n*100)/100); }
function formatNum(n){ return (Number.isInteger(n) ? n : q(n)).toLocaleString('ja-JP'); }

function calculateAll(){
  const days = Math.max(1, parseInt(document.getElementById('days').value||3,10));
  const infants = Math.max(0, parseInt(document.getElementById('infants').value||0,10));
  const children = Math.max(0, parseInt(document.getElementById('children').value||0,10));
  const adults = Math.max(0, parseInt(document.getElementById('adults').value||0,10));
  const elderly = Math.max(0, parseInt(document.getElementById('elderly').value||0,10));
  const notes = document.getElementById('notes').value || '';

  const totalPeople = infants + children + adults + elderly;

  const water = (
    infants*cfg.waterPerDay.infant +
    children*cfg.waterPerDay.child +
    adults*cfg.waterPerDay.adult +
    elderly*cfg.waterPerDay.elderly
  ) * days;

  const foodMeals = totalPeople * cfg.foodMealsPerDay * days;
  const diapers = infants * cfg.diapersPerInfantPerDay * days;
  const formulaLiters = infants * cfg.formulaLitersPerInfantPerDay * days;
  const blankets = totalPeople * cfg.blanketsPerPerson;
  const flashlights = Math.ceil(totalPeople / cfg.flashlightPerPeople);
  const radio = totalPeople > 0 ? 1 : 0;
  const firstAid = totalPeople > 0 ? 1 : 0;
  const masks = totalPeople * cfg.masksPerPersonPerDay * days;
  const toiletBags = totalPeople * cfg.toiletBagsPerPersonPerDay * days;

  return {
    inputs: { days, infants, children, adults, elderly, totalPeople, notes },
    items: {
      water: q(water),
      foodMeals: Math.ceil(foodMeals),
      diapers: Math.ceil(diapers),
      formulaLiters: q(formulaLiters),
      blankets: Math.ceil(blankets),
      flashlights,
      radio,
      firstAid,
      masks: Math.ceil(masks),
      toiletBags: Math.ceil(toiletBags)
    }
  };
}

function renderResult(res){
  const s = document.getElementById('summary');
  const itemsEl = document.getElementById('items');
  const notesEl = document.getElementById('resultNotes');
  const { days, infants, children, adults, elderly, totalPeople, notes } = res.inputs;
  s.innerHTML = `<p>合計人数: <strong>${totalPeople}</strong> 人（乳児:${infants}、子ども:${children}、大人:${adults}、高齢者:${elderly}）、備蓄日数: <strong>${days}</strong> 日</p>`;
  itemsEl.innerHTML = '';
  function li(html){ const el=document.createElement('li'); el.innerHTML=html; itemsEl.appendChild(el); }
  li(`<strong>飲料水</strong>: ${formatNum(res.items.water)} L`);
  li(`<strong>備蓄食料</strong>: 約 ${res.items.foodMeals} 食分`);
  if(infants>0){
    li(`<strong>粉ミルク（目安）</strong>: 約 ${formatNum(res.items.formulaLiters)} L`);
    li(`<strong>オムツ</strong>: 約 ${res.items.diapers} 枚`);
  }
  li(`<strong>毛布・ブランケット</strong>: ${res.items.blankets} 枚`);
  li(`<strong>懐中電灯</strong>: ${res.items.flashlights} 個`);
  li(`<strong>携帯ラジオ</strong>: ${res.items.radio} 台`);
  li(`<strong>救急箱（家庭用）</strong>: ${res.items.firstAid} 個`);
  li(`<strong>マスク</strong>: 約 ${res.items.masks} 枚`);
  li(`<strong>携帯トイレ用袋</strong>: 約 ${res.items.toiletBags} 個`);
  let noteHtml = '';
  if(notes) noteHtml += `<p>特記事項: ${escapeHtml(notes)}</p>`;
  noteHtml += `<p>※常備薬や持病がある場合は、必要量を個別に確保してください（医師の指示に従う）。ペットがいる場合はペット用の食糧・水も確保してください。</p>`;
  notesEl.innerHTML = noteHtml;
  document.getElementById('result').classList.remove('hidden');
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.getElementById('calcBtn').addEventListener('click', ()=>{
  const res = calculateAll();
  renderResult(res);
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  document.getElementById('calcForm').reset();
  document.getElementById('days').value = 3;
  document.getElementById('adults').value = 1;
  document.getElementById('result').classList.add('hidden');
});

// Wizard (step) logic
let currentStep = 1;
const totalSteps = 4;
function showStep(n){
  currentStep = Math.max(1, Math.min(totalSteps, n));
  document.querySelectorAll('.wizard .step').forEach(el=>{
    const s = parseInt(el.dataset.step,10);
    if(s===currentStep) el.classList.add('active'); else el.classList.remove('active');
  });
  const pct = Math.round(((currentStep-1)/(totalSteps-1))*100);
  const bar = document.getElementById('progressBar'); if(bar) bar.style.width = pct + '%';
  const ind = document.getElementById('stepIndicator'); if(ind) ind.textContent = `ステップ ${currentStep} / ${totalSteps}`;
  const prev = document.getElementById('prevStepBtn'); const next = document.getElementById('nextStepBtn');
  if(prev) prev.classList.toggle('hidden', currentStep===1);
  if(next) next.classList.toggle('hidden', currentStep===totalSteps);
}
document.getElementById('nextStepBtn').addEventListener('click', ()=>{ showStep(currentStep+1); });
document.getElementById('prevStepBtn').addEventListener('click', ()=>{ showStep(currentStep-1); });
showStep(1);

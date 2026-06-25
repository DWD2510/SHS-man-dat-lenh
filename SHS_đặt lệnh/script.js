/* ─── STATE ─── */
const S = {
  ff: null,      // focused field
  vKL: 0,
  vGia: 0,
  cbOn: false,
  chip: 'LO',
  orders: [
    {id:1,side:'buy',code:'HPG',st:'wait',p:'27,75',mp:'—',mq:'0',q:'1.000'},
    {id:2,side:'sell',code:'HPG',st:'partial',p:'27,75',mp:'27,75',mq:'500',q:'1.000'},
    {id:3,side:'buy',code:'HPG',st:'filled',p:'27,75',mp:'27,75',mq:'1.000',q:'1.000'},
    {id:4,side:'sell',code:'HPG',st:'cancel',p:'27,75',mp:'—',mq:'0',q:'500'},
  ],
  portfolio: [
    {code:'HPG',plPct:'-339,2%',plAbs:'-333.434.500',plDay:'+4.434.500 (+3,9%)',price:'27,60',avg:'24,55',qty:5000,total:50000},
    {code:'ACB',plPct:'+52%',plAbs:'-333.434.500',plDay:'+4.434.500 (+3,9%)',price:'27,60',avg:'24,55',qty:5000,total:50000},
    {code:'HPG',plPct:'+52%',plAbs:'-333.434.500',plDay:'-4.434.500 (-3,9%)',price:'27,60',avg:'24,55',qty:5000,total:50000},
  ],
  filter: 'all',
  oSide: null,
  nid: 5,
  tkLbl: 'TK 00',
  lenhLbl: 'Lệnh thường',
  kbOpen: false,
  curTab: 1,
  vOTP: '',
  otpMethod: 'smart',
  otpCountdown: 28,
  otpTimer: null,
  selectedStock: 'HPG',
  vGiaKH: 0,
  vChotLai: 0,
  vCutLoss: 0,
  cond: 'ge',
  orderType: 'LO',
  hieuLuc: '',
  editString: '',
  recentSearches: ['HPG', 'SSI']
};

const STOCKS = {
  'HPG': { name: 'Tập đoàn Hòa Phát', price: '27,75', ref: '27,80', ceil: '29,80', floor: '25,85', change: '+0,35', pct: '+1,23%', minPrice: '27,50', avgPrice: '27,70', maxPrice: '27,90', isUp: true, vol: '12.500.000', type: 'stocks' },
  'SSI': { name: 'CTCP Chứng khoán SSI', price: '35,20', ref: '35,20', ceil: '37,65', floor: '32,75', change: '0,00', pct: '0,00%', minPrice: '34,80', avgPrice: '35,30', maxPrice: '35,80', isUp: false, vol: '8.200.000', type: 'stocks' },
  'VND': { name: 'CTCP Chứng khoán VNDIRECT', price: '22,10', ref: '22,10', ceil: '23,60', floor: '20,55', change: '−0,30', pct: '−1,34%', minPrice: '21,90', avgPrice: '22,15', maxPrice: '22,40', isUp: false, vol: '5.100.000', type: 'stocks' },
  'VIX': { name: 'CTCP Chứng khoán VIX', price: '18,40', ref: '18,05', ceil: '19,30', floor: '16,80', change: '+0,35', pct: '+1,94%', minPrice: '17,90', avgPrice: '18,20', maxPrice: '18,50', isUp: true, vol: '15.400.000', type: 'stocks' },
  'FTS': { name: 'CTCP Chứng khoán FPT', price: '61,00', ref: '57,10', ceil: '61,00', floor: '53,20', change: '+3,90', pct: '+6,83%', minPrice: '56,80', avgPrice: '57,90', maxPrice: '58,50', isUp: true, vol: '1.200.000', type: 'stocks' },
  'PC1': { name: 'CTCP Tập đoàn PC1', price: '26,60', ref: '28,60', ceil: '30,60', floor: '26,60', change: '−2,00', pct: '−6,99%', minPrice: '28,00', avgPrice: '28,30', maxPrice: '28,85', isUp: false, vol: '3.400.000', type: 'stocks' },
  'HSG': { name: 'CTCP Tập đoàn Hoa Sen', price: '23,05', ref: '23,50', ceil: '25,10', floor: '21,90', change: '−0,45', pct: '−1,91%', minPrice: '22,80', avgPrice: '23,10', maxPrice: '23,60', isUp: false, vol: '9.600.000', type: 'stocks' },
  'HPX': { name: 'CTCP Đầu tư Hải Phát', price: '6,45', ref: '6,30', ceil: '6,74', floor: '5,86', change: '+0,15', pct: '+2,38%', minPrice: '6,20', avgPrice: '6,40', maxPrice: '6,55', isUp: true, vol: '4.800.000', type: 'stocks' },
  'VN30F2606': { name: 'HĐTL VN30 ngày đáo hạn 18/06/2026', price: '1.285,4', ref: '1.280,0', ceil: '1.369,6', floor: '1.190,4', change: '+5,4', pct: '+0,42%', minPrice: '1.278,0', avgPrice: '1.283,5', maxPrice: '1.288,0', isUp: true, vol: '185.000', type: 'derivatives' },
  'HPG2601': { name: 'Chứng quyền HPG-CHSC2601', price: '1,25', ref: '1,20', ceil: '1,50', floor: '0,90', change: '+0,05', pct: '+4,17%', minPrice: '1,15', avgPrice: '1,22', maxPrice: '1,28', isUp: true, vol: '500.000', type: 'cw' }
};

/* ─── FORMAT HELPERS ─── */
function formatPrice(val) {
  if (!val) return '';
  return val.toFixed(2).replace('.', ',').replace(/,00$/, '').replace(/,(\d)0$/, ',$1');
}

/* ─── SEARCH & STOCK SELECTION ─── */
let srchTimeoutTimer = null;
let activeSrchTab = 'recent';
let srchKbUpper = true;

function renderSrchRow(s) {
  const isUp = s.isUp;
  const colorCls = isUp ? 'gn' : 'rd';
  const priceChange = s.change;
  const pctChange = s.pct;
  const volVal = s.vol || '1.200.000';
  const cleanChange = priceChange.replace('−', '-');
  
  return `
    <div class="srch-row-item" onclick="selectStock('${s.code}')">
      <div class="srch-col-code">${s.code}</div>
      <div class="srch-col-name">
        <span class="srch-col-market">${s.code.length > 5 ? 'HNX' : 'HOSE'}</span>
        <span>${s.name}</span>
      </div>
      <div class="srch-col-values">
        <div class="srch-col-price ${colorCls}">${s.price}</div>
        <div class="srch-col-vol" style="font-size: 10px">${volVal} CP</div>
      </div>
    </div>
  `;
}

function renderRecentList() {
  const listEl = document.getElementById('srchRecentList');
  if (!listEl) return;
  
  let list = [];
  if (activeSrchTab === 'recent') {
    const recentCodes = S.recentSearches && S.recentSearches.length > 0 ? S.recentSearches : ['HPG', 'SSI', 'VND'];
    if (!recentCodes.includes('HPG')) {
      recentCodes.unshift('HPG');
    }
    list = recentCodes.map(code => STOCKS[code]).filter(Boolean);
  } else {
    list = Object.values(STOCKS);
    if (activeSrchTab !== 'all') {
      list = list.filter(item => item.type === activeSrchTab);
    }
  }
  
  if (list.length === 0) {
    listEl.innerHTML = `<div style="padding:16px;text-align:center;font-size:12px;color:var(--t2)">Danh sách trống</div>`;
    return;
  }
  
  listEl.innerHTML = list.map(s => {
    const code = Object.keys(STOCKS).find(key => STOCKS[key] === s);
    return renderSrchRow({ code, ...s });
  }).join('');
}

function renderSearchHistoryCards() {
  const container = document.getElementById('srchHistoryTags');
  if (!container) return;
  const codes = ['VIX', 'FTS', 'SSI', 'PC1', 'HSG'];
  container.innerHTML = codes.map(code => {
    const s = STOCKS[code];
    if (!s) return '';
    
    let colorClass = 'ye'; // default Reference (Yellow)
    const price = parseFloat(s.price.replace(',', '.'));
    const ref = parseFloat(s.ref.replace(',', '.'));
    const ceil = parseFloat(s.ceil.replace(',', '.'));
    const floor = parseFloat(s.floor.replace(',', '.'));
    
    if (price >= ceil) colorClass = 'pu'; // Ceiling -> Purple
    else if (price <= floor) colorClass = 'cy'; // Floor -> Cyan
    else if (price > ref) colorClass = 'gn'; // Gain -> Green
    else if (price < ref) colorClass = 'rd'; // Loss -> Red
    
    return `
      <div class="srch-history-card" onclick="selectStock('${code}')">
        <div class="srch-hist-ticker">${code}</div>
        <div class="srch-hist-meta ${colorClass}">
          <span>${s.price}</span>
          <span>(${s.pct})</span>
        </div>
      </div>
    `;
  }).join('');
}


function openSearchOv() {
  openOv('ovSearch');
  const inputEl = document.getElementById('srchInput');
  inputEl.value = '';
  inputEl.placeholder = 'Tìm kiếm...';
  document.getElementById('srchClear').style.display = 'none';
  activeSrchTab = 'recent';
  
  const tabs = ['recent', 'all', 'stocks', 'derivatives', 'cw'];
  tabs.forEach(t => {
    const el = document.getElementById('srchTab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) {
      el.classList.toggle('on', t === 'recent');
    }
  });
  
  onSrchInput('');
  renderSearchHistoryCards();
  dismissSrchKb();
  setTimeout(() => {
    inputEl.focus();
  }, 300);
}

function focusSrchInput() {
  const inputEl = document.getElementById('srchInput');
  inputEl.placeholder = 'Search...';
  
  const kbEl = document.getElementById('srchKb');
  if (kbEl) {
    kbEl.classList.add('open');
  }
  
  const scrollEl = document.getElementById('srchScrollBody');
  if (scrollEl) {
    scrollEl.classList.add('kb-active');
  }
}

function dismissSrchKb() {
  const kbEl = document.getElementById('srchKb');
  if (kbEl) {
    kbEl.classList.remove('open');
  }
  const scrollEl = document.getElementById('srchScrollBody');
  if (scrollEl) {
    scrollEl.classList.remove('kb-active');
  }
}

function clearSrch() {
  const inputEl = document.getElementById('srchInput');
  inputEl.value = '';
  document.getElementById('srchClear').style.display = 'none';
  onSrchInput('');
  inputEl.focus();
}

function retrySrch() {
  clearSrch();
}

function onSrchInput(val) {
  val = val.trim();
  const clearBtn = document.getElementById('srchClear');
  clearBtn.style.display = val ? 'block' : 'none';
  
  const srchDefault = document.getElementById('srchDefault');
  const srchSuggest = document.getElementById('srchSuggest');
  const srchLoading = document.getElementById('srchLoading');
  const srchTimeout = document.getElementById('srchTimeout');
  const srchEmpty = document.getElementById('srchEmpty');
  const srchExactMatch = document.getElementById('srchExactMatch');
  
  srchDefault.style.display = 'none';
  srchSuggest.style.display = 'none';
  srchLoading.style.display = 'none';
  srchTimeout.style.display = 'none';
  srchEmpty.style.display = 'none';
  srchExactMatch.style.display = 'none';
  
  if (!val) {
    srchDefault.style.display = 'block';
    renderRecentList();
    return;
  }
  
  const lowerVal = val.toLowerCase();
  
  if (lowerVal === 'hpfg') {
    srchEmpty.style.display = 'flex';
    dismissSrchKb();
    return;
  }
  
  if (lowerVal === 'hpg') {
    srchExactMatch.style.display = 'block';
    renderExactMatchList('HPG');
    dismissSrchKb();
    return;
  }
  
  const suggestions = [];
  const listMatches = [];
  
  for (const [code, info] of Object.entries(STOCKS)) {
    if (code.toLowerCase().includes(lowerVal) || info.name.toLowerCase().includes(lowerVal)) {
      listMatches.push({ code, ...info });
      if (suggestions.length < 3) {
        suggestions.push({ code, name: info.name });
      }
    }
  }
  
  if (listMatches.length > 0) {
    srchSuggest.style.display = 'block';
    
    const sugTagsEl = document.getElementById('srchSugTags');
    sugTagsEl.innerHTML = suggestions.map(s => `
      <span class="srch-sug-tag" onclick="selectStock('${s.code}')">${s.code}</span>
    `).join('');
    
    const sugListEl = document.getElementById('srchSugList');
    sugListEl.innerHTML = listMatches.map(s => renderSrchRow(s)).join('');
  } else {
    srchEmpty.style.display = 'flex';
  }
}

function renderExactMatchList(code) {
  const listEl = document.getElementById('srchExactList');
  if (!listEl) return;
  
  const matches = [];
  const lowerCode = code.toLowerCase();
  for (const [c, info] of Object.entries(STOCKS)) {
    if (c.toLowerCase().includes(lowerCode)) {
      matches.push({ code: c, ...info });
    }
  }
  
  listEl.innerHTML = matches.map(s => renderSrchRow(s)).join('');
}

function selectStock(code) {
  if (!STOCKS[code]) return;
  S.selectedStock = code;
  
  S.vKL = 0;
  S.vGia = 0;
  S.vGiaKH = 0;
  S.vChotLai = 0;
  S.vCutLoss = 0;
  S.editString = '';
  
  if (!S.recentSearches.includes(code)) {
    S.recentSearches.unshift(code);
  } else {
    S.recentSearches = S.recentSearches.filter(c => c !== code);
    S.recentSearches.unshift(code);
  }
  if (S.recentSearches.length > 5) {
    S.recentSearches.pop();
  }
  
  document.getElementById('hdrSrchVal').textContent = code;
  
  const info = STOCKS[code];
  document.getElementById('curPrice').textContent = info.price;
  document.getElementById('curPrice').className = 'pbig ' + (info.isUp ? 'gn' : 'rd');
  
  const arrow = info.isUp 
    ? `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 3L9.5 7.5h-7z" fill="#10bf2d"/></svg>`
    : `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 9L2.5 4.5h7z" fill="#ff1f1f"/></svg>`;
  
  document.getElementById('curChangeWrap').innerHTML = `
    <div class="pdn" style="color: var(--${info.isUp?'gn':'rd'})">${arrow}${info.change}</div>
    <div class="pdn" style="color: var(--${info.isUp?'gn':'rd'})">${info.pct}</div>
  `;
  
  document.getElementById('lblCeil').textContent = info.ceil;
  document.getElementById('lblRef').textContent = info.ref;
  document.getElementById('lblFloor').textContent = info.floor;
  
  document.getElementById('lblHigh').textContent = info.maxPrice;
  document.getElementById('lblAvg').textContent = info.avgPrice;
  document.getElementById('lblLow').textContent = info.minPrice;
  
  renF('KL');
  renF('Gia');
  renF('GiaKH');
  renF('ChotLai');
  renF('CutLoss');
  
  updateOrderBook(code);
  
  const searchOv = document.getElementById('ovSearch');
  if (searchOv && searchOv.classList.contains('open')) {
    closeOv('ovSearch');
    dismissSrchKb();
    showToast('Đã chọn mã CK: ' + code);
  }
}

function switchSrchTab(cat) {
  activeSrchTab = cat;
  const tabs = ['recent', 'all', 'stocks', 'derivatives', 'cw'];
  tabs.forEach(t => {
    const el = document.getElementById('srchTab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) {
      el.classList.toggle('on', t === cat);
    }
  });
  renderRecentList();
}

function srchKbIn(char) {
  const inputEl = document.getElementById('srchInput');
  if (!inputEl) return;
  const typed = srchKbUpper ? char.toUpperCase() : char.toLowerCase();
  inputEl.value += typed;
  onSrchInput(inputEl.value);
}

function srchKbDel() {
  const inputEl = document.getElementById('srchInput');
  if (!inputEl) return;
  inputEl.value = inputEl.value.slice(0, -1);
  onSrchInput(inputEl.value);
}

function srchKbToggleCase() {
  srchKbUpper = !srchKbUpper;
  const keys = document.querySelectorAll('.srch-kb .skk:not(.sp-shift):not(.sp-del):not(.sp-num):not(.sp-space):not(.sp-done)');
  keys.forEach(k => {
    k.textContent = srchKbUpper ? k.textContent.toUpperCase() : k.textContent.toLowerCase();
  });
}

function srchKbToggleSym() {
  showToast('Chế độ ký tự số');
}

function srchKbDone() {
  const inputEl = document.getElementById('srchInput');
  onSrchInput(inputEl.value);
  dismissSrchKb();
}

/* ─── DYNAMIC ORDER BOOK ─── */
function updateOrderBook(code) {
  const info = STOCKS[code];
  if (!info) return;
  const ref = parseFloat(info.ref.replace(',', '.'));
  const step = 0.05;
  const curPrice = parseFloat(info.price.replace(',', '.'));
  
  const buyPrices = [curPrice, curPrice - step, curPrice - 2 * step];
  const sellPrices = [curPrice + step, curPrice + 2 * step, curPrice + 3 * step];
  
  const getCls = (p) => {
    const diff = Math.round((p - ref) * 100) / 100;
    if (diff > 0) return 'gn';
    if (diff < 0) return 'rd';
    return 'ye';
  };
  
  const buyHtml = buyPrices.map(p => {
    const priceStr = p.toFixed(2).replace('.', ',');
    const cls = getCls(p);
    return `<div class="opp ${cls}" onclick="setOrderPrice('${priceStr}')" style="cursor:pointer">${priceStr}</div>`;
  }).join('');
  
  const sellHtml = sellPrices.map(p => {
    const priceStr = p.toFixed(2).replace('.', ',');
    const cls = getCls(p);
    return `<div class="opp ${cls}" onclick="setOrderPrice('${priceStr}')" style="cursor:pointer">${priceStr}</div>`;
  }).join('');
  
  document.getElementById('obBuyPrices').innerHTML = buyHtml;
  document.getElementById('obSellPrices').innerHTML = sellHtml;
}

function setOrderPrice(priceStr) {
  if (S.orderType !== 'LO') {
    selLenh('Lệnh thường', 'LO');
  }
  S.vGia = parseFloat(priceStr.replace(',', '.'));
  if (S.ff === 'Gia') {
    S.editString = priceStr;
  }
  renF('Gia');
  showToast('Đã chọn giá: ' + priceStr);
}

/* ─── CLOCK ─── */
(function tick(){
  const n=new Date();
  document.getElementById('clk').textContent=
    n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
  setTimeout(tick,15000);
})();

/* ─── SEGMENTED ─── */
function segCk(el){
  document.querySelectorAll('.seg-i').forEach(x=>x.classList.remove('on'));
  el.classList.add('on');
}

/* ─── CHECKBOX ─── */
function togCB(){
  S.cbOn=!S.cbOn;
  document.getElementById('cbBox').classList.toggle('on',S.cbOn);
}

/* ─── CHIP ─── */
function selChip(c){
  S.chip=c;
  ['LO','MTL','ATO','ATC'].forEach(x=>{
    const el=document.getElementById('c'+x);
    if(el) el.classList.toggle('on',c===x);
  });
  const isMarket = c!=='LO';
  const tGia = document.getElementById('tGia');
  const stGia = document.getElementById('stGia');
  if(isMarket){
    tGia.textContent = c;
    tGia.style.color = '#707070';
    stGia.style.pointerEvents = 'none';
    if(S.ff==='Gia') focF('KL');
  } else {
    tGia.style.color = '';
    stGia.style.pointerEvents = '';
    renF('Gia');
  }
  validateAndRefreshForm();
}

/* ─── RENDER FIELD ─── */
function renF(f){
  const tEl = document.getElementById('t' + f);
  const vEl = document.getElementById('v' + f);
  if (!tEl || !vEl) return;
  
  const foc = S.ff === f;
  let displayVal = '';
  let hasVal = false;
  
  if (foc) {
    displayVal = S.editString;
    hasVal = !!displayVal;
  } else {
    if (f === 'KL') {
      displayVal = S.vKL > 0 ? S.vKL.toLocaleString('vi-VN') : '';
      hasVal = S.vKL > 0;
    } else {
      const val = S['v' + f];
      displayVal = val > 0 ? formatPrice(val) : '';
      hasVal = val > 0;
    }
  }
  
  if (f === 'Gia' && ['MTL', 'ATO', 'ATC'].includes(S.chip)) {
    tEl.textContent = S.chip;
    tEl.style.color = '#707070';
    vEl.classList.add('has');
  } else {
    tEl.textContent = displayVal || (foc ? '' : '00');
    tEl.style.color = '';
    vEl.classList.toggle('has', hasVal);
  }
  
  validateAndRefreshForm();
}

function validateAndRefreshForm() {
  const kl = S.vKL || 0;
  const isMarket = ['MTL', 'ATO', 'ATC'].includes(S.chip);
  const stockInfo = STOCKS[S.selectedStock];
  const refPrice = stockInfo ? parseFloat(stockInfo.ref.replace(',', '.')) : 0;
  
  let priceVal = 0;
  if (isMarket) {
    priceVal = refPrice;
  } else if (S.orderType === 'OCO') {
    priceVal = S.vChotLai || S.vCutLoss || refPrice;
  } else {
    priceVal = S.vGia || 0;
  }
  
  let gtText = '0đ';
  if (kl && priceVal) {
    gtText = (kl * priceVal * 1000).toLocaleString('vi-VN') + 'đ';
    if (isMarket) {
      gtText += ` (Tạm tính theo ${S.chip})`;
    }
  }
  
  const gtLEl = document.getElementById('gtL');
  if (gtLEl) {
    gtLEl.textContent = gtText;
  }
  
  const klOk = kl > 0;
  let priceOk = false;
  
  if (S.orderType === 'LO') {
    priceOk = isMarket || S.vGia > 0;
  } else if (S.orderType === 'Stop') {
    priceOk = S.vGia > 0 && S.vGiaKH > 0;
  } else if (S.orderType === 'TCO') {
    priceOk = S.vGia > 0 && (S.vChotLai > 0 || S.vCutLoss > 0);
  } else if (S.orderType === 'OCO') {
    priceOk = S.vGiaKH > 0 && (S.vChotLai > 0 || S.vCutLoss > 0);
  } else if (S.orderType === 'Bull Bear') {
    priceOk = S.vGia > 0 && S.vGiaKH > 0 && (S.vChotLai > 0 || S.vCutLoss > 0);
  } else {
    priceOk = isMarket || S.vGia > 0;
  }
  
  const enabled = klOk && priceOk;
  const btnM = document.getElementById('btnM');
  const btnB = document.getElementById('btnB');
  if (btnM) btnM.disabled = !enabled;
  if (btnB) btnB.disabled = !enabled;

  /* Real-time inline validation */
  realtimeValidate();
}

/* ─── FOCUS + OPEN KB ─── */
function focF(f){
  S.ff=f;
  const fields = ['KL', 'Gia', 'GiaKH', 'ChotLai', 'CutLoss'];
  fields.forEach(x => {
    const el = document.getElementById('st' + x);
    if (el) el.classList.toggle('foc', f === x);
  });
  
  if (f !== 'OTP') {
    if (f === 'KL') {
      S.editString = S.vKL > 0 ? S.vKL.toString() : '';
    } else {
      const val = S['v' + f] || 0;
      S.editString = val > 0 ? formatPrice(val) : '';
    }
  }
  
  fields.forEach(x => renF(x));
  
  if (f === 'OTP') {
    document.getElementById('kb').style.zIndex = '55';
    renderOTPBoxes();
  } else {
    document.getElementById('kb').style.zIndex = '30';
  }

  const wasOpen = S.kbOpen;
  if(!S.kbOpen){
    S.kbOpen = true;
    document.getElementById('kb').classList.add('open');
    document.getElementById('bd').classList.add('kb-active');
  }

  const doScroll = () => {
    const body = document.getElementById('bd');
    const form = document.getElementById('ofm');
    const bodyRect = body.getBoundingClientRect();
    const formRect = form.getBoundingClientRect();
    const delta = formRect.top - bodyRect.top;
    body.scrollTop = body.scrollTop + delta;
  };

  if (f !== 'OTP') {
    if(!wasOpen){
      setTimeout(doScroll, 310);
    } else {
      doScroll();
    }
  }
}

/* ─── STEP ─── */
function stepV(f,d){
  if(f==='KL'){
    let n = S.vKL || 0;
    n = Math.max(0, n + d);
    S.vKL = n;
    if (S.ff === 'KL') {
      S.editString = n > 0 ? n.toString() : '';
    }
    renF('KL');
  } else {
    let key = 'v' + f;
    let val = S[key] || 0;
    val = Math.max(0, Math.round((val + d) * 100) / 100);
    S[key] = val;
    if (S.ff === f) {
      S.editString = val > 0 ? formatPrice(val) : '';
    }
    renF(f);
  }
}

/* ─── KEYBOARD ─── */
function kbIn(ch){
  const f=S.ff; if(!f)return;
  if (f === 'OTP') {
    if (ch === ',') return;
    if (S.vOTP.length >= 4) return;
    S.vOTP += ch;
    renderOTPBoxes();
    if (S.vOTP.length === 4) {
      document.getElementById('otpVerifyBtn').disabled = false;
    }
  } else if(f==='KL'){
    if(ch===',')return;
    if (S.editString === '0') S.editString = '';
    if(S.editString.length>=8)return;
    S.editString += ch;
    S.vKL = parseInt(S.editString) || 0;
    renF('KL');
  } else {
    if(ch===','&&S.editString.includes(','))return;
    if(S.editString.includes(',')&&S.editString.split(',')[1].length>=2)return;
    if(S.editString.length>=8)return;
    S.editString += ch;
    S['v' + f] = parseFloat(S.editString.replace(',', '.')) || 0;
    renF(f);
  }
}

function kbDel(){
  const f=S.ff; if(!f)return;
  if (f === 'OTP') {
    S.vOTP = S.vOTP.slice(0, -1);
    renderOTPBoxes();
    document.getElementById('otpVerifyBtn').disabled = true;
    document.getElementById('otpError').style.display = 'none';
  } else if(f==='KL'){
    S.editString = S.editString.slice(0, -1);
    S.vKL = parseInt(S.editString) || 0;
    renF('KL');
  } else {
    const key = 'v' + f;
    S.editString = S.editString.slice(0, -1);
    S[key] = parseFloat(S.editString.replace(',', '.')) || 0;
    renF(f);
  }
}

/* ─── OVERLAYS ─── */
function openOv(id){document.getElementById(id).classList.add('open');}
function closeOv(id){
  document.getElementById(id).classList.remove('open');
  if (id === 'ovOTP') {
    clearInterval(S.otpTimer);
    document.getElementById('ovOTP').classList.remove('kb-active');
  }
}
function bgClose(e,id){if(e.target===document.getElementById(id))closeOv(id);}
function bgCloseCfm(e,id){if(e.target===document.getElementById(id))closeOv(id);}

function kbStep(d) {
  const f = S.ff; if (!f) return;
  if (f === 'OTP') return;
  if (f === 'KL') stepV('KL', d * 100);
  else stepV(f, d * 0.1);
}

function dismissKB() {
  S.kbOpen = false; S.ff = null;
  document.getElementById('kb').classList.remove('open');
  document.getElementById('bd').classList.remove('kb-active');
  const fields = ['KL', 'Gia', 'GiaKH', 'ChotLai', 'CutLoss'];
  fields.forEach(x => {
    const el = document.getElementById('st' + x);
    if (el) el.classList.remove('foc');
  });

  document.getElementById('kb').style.zIndex = '30';
  if (document.getElementById('ovOTP').classList.contains('open')) {
    renderOTPBoxes();
  }

  if (!document.getElementById('ovOTP').classList.contains('open')) {
    setTimeout(() => {
      const body = document.getElementById('bd');
      const form = document.getElementById('ofm');
      const bodyRect = body.getBoundingClientRect();
      const formRect = form.getBoundingClientRect();
      const delta = formRect.top - bodyRect.top;
      body.scrollTop = Math.max(0, body.scrollTop + delta - 80);
    }, 320);
  }
}

/* ─── OTP FLOW ─── */
function showOTP() {
  closeOv('ovConfirm');
  openOv('ovOTP');
  document.getElementById('ovOTP').classList.add('kb-active');
  initOTP();
}

function initOTP() {
  S.vOTP = '';
  S.otpMethod = 'smart';
  document.querySelectorAll('.otp-method-chip').forEach(c => {
    c.classList.toggle('on', c.id === 'otpMSmart');
  });

  document.getElementById('otpSubIns').textContent = 'Vui lòng nhập mã OTP được gửi tới số điện thoại 0998***388 để xác thực thông tin';
  document.getElementById('otpError').style.display = 'none';
  document.getElementById('otpVerifyBtn').disabled = true;

  renderOTPBoxes();

  S.otpCountdown = 28;
  const link = document.getElementById('otpResendLink');
  link.textContent = `Gửi lại OTP (${S.otpCountdown})`;
  link.classList.remove('active');
  link.style.pointerEvents = 'none';

  clearInterval(S.otpTimer);
  S.otpTimer = setInterval(() => {
    S.otpCountdown--;
    if (S.otpCountdown <= 0) {
      clearInterval(S.otpTimer);
      link.textContent = 'Gửi lại OTP';
      link.classList.add('active');
      link.style.pointerEvents = 'auto';
    } else {
      link.textContent = `Gửi lại OTP (${S.otpCountdown})`;
    }
  }, 1000);

  focF('OTP');
}

function selOTPMethod(method) {
  clearInterval(S.otpTimer);
  S.otpMethod = method;
  const chips = {
    smart: 'otpMSmart',
    card: 'otpMCard',
    sms: 'otpMSMS',
    other: 'otpMOther'
  };

  for (const [key, id] of Object.entries(chips)) {
    document.getElementById(id).classList.toggle('on', key === method);
  }

  const subIns = document.getElementById('otpSubIns');
  if (method === 'smart' || method === 'sms') {
    subIns.textContent = 'Vui lòng nhập mã OTP được gửi tới số điện thoại 0998***388 để xác thực thông tin';
  } else if (method === 'card') {
    subIns.textContent = 'Nhập mã số tương ứng trên thẻ OTP của bạn để xác thực';
  } else {
    subIns.textContent = 'Sử dụng phương thức xác thực đã đăng ký trên thiết bị khác';
  }

  S.vOTP = '';
  document.getElementById('otpError').style.display = 'none';
  document.getElementById('otpVerifyBtn').disabled = true;
  document.querySelectorAll('.otp-box').forEach(b => b.classList.remove('err'));
  renderOTPBoxes();

  S.otpCountdown = 28;
  const link = document.getElementById('otpResendLink');
  if (link) {
    link.textContent = `Gửi lại OTP (${S.otpCountdown})`;
    link.classList.remove('active');
    link.style.pointerEvents = 'none';
  }

  S.otpTimer = setInterval(() => {
    S.otpCountdown--;
    if (S.otpCountdown <= 0) {
      clearInterval(S.otpTimer);
      if (link) {
        link.textContent = 'Gửi lại OTP';
        link.classList.add('active');
        link.style.pointerEvents = 'auto';
      }
    } else {
      if (link) {
        link.textContent = `Gửi lại OTP (${S.otpCountdown})`;
      }
    }
  }, 1000);
}

function resendOTP() {
  if (S.otpCountdown > 0) return;
  showToast('Đã gửi lại mã OTP');
  initOTP();
}

function renderOTPBoxes() {
  const code = S.vOTP || '';
  for (let i = 0; i < 4; i++) {
    const charEl = document.getElementById(`otpChar${i}`);
    const boxEl = charEl.parentElement;

    if (i < code.length) {
      charEl.textContent = code[i];
      boxEl.classList.remove('foc');
    } else {
      charEl.textContent = '';
      boxEl.classList.toggle('foc', S.ff === 'OTP' && i === code.length);
    }
  }
}

function verifyOTP() {
  if (S.vOTP.length < 4) return;

  if (S.vOTP === '0000') {
    document.getElementById('otpError').style.display = 'block';
    document.querySelectorAll('.otp-box').forEach(b => b.classList.add('err'));
    showToast('Mã OTP không chính xác');
    setTimeout(() => {
      document.querySelectorAll('.otp-box').forEach(b => b.classList.remove('err'));
    }, 500);
    return;
  }

  clearInterval(S.otpTimer);
  closeOv('ovOTP');
  document.getElementById('ovOTP').classList.remove('kb-active');
  confirmOrder();
}

/* ─── VALIDATION ─── */
let _toastTimer = null;

const TOP_TOAST_ICONS = {
  success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#10bf2d" />
    <path d="M6 10.2l2.6 2.6L14.5 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`,
  error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#ff1f1f" />
    <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round" />
  </svg>`
};

function showTopToast(msg, type = 'error') {
  const el = document.getElementById('topToast');
  const msgEl = document.getElementById('topToastMsg');
  const iconEl = document.getElementById('topToastIcon');
  if (!el) return;
  if (msgEl) msgEl.textContent = msg;
  if (iconEl) iconEl.innerHTML = TOP_TOAST_ICONS[type] || TOP_TOAST_ICONS.error;
  clearTimeout(_toastTimer);
  el.classList.remove('hide');
  // force reflow
  void el.offsetWidth;
  el.classList.add('show');
  _toastTimer = setTimeout(closeTopToast, 4000);
}
function closeTopToast() {
  const el = document.getElementById('topToast');
  if (!el) return;
  clearTimeout(_toastTimer);
  el.classList.remove('show');
  el.classList.add('hide');
  setTimeout(() => el.classList.remove('hide'), 300);
}

function showErrToast(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}
function hideErrToast(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('show'); el.textContent = ''; }
}

/* Real-time validation — called every time a value changes */
function realtimeValidate() {
  const stock = STOCKS[S.selectedStock];

  /* VAL_QTY_OVER: check for both buy and sell (BAN triggers quantity check) */
  const availableQty = (() => {
    const p = S.portfolio.find(x => x.code === S.selectedStock);
    return p ? p.qty : 0;
  })();
  if (S.vKL > 0 && availableQty > 0 && S.vKL > availableQty) {
    showErrToast('errKL', 'Khối lượng đặt vượt quá khối lượng nắm giữ');
  } else {
    hideErrToast('errKL');
  }

  /* VAL_PRICE_CEILING / VAL_PRICE_FLOOR */
  const isMarket = ['MTL','ATO','ATC'].includes(S.chip);
  if (!isMarket && stock && S.vGia > 0) {
    const ceilVal = parseFloat(stock.ceil.replace(',','.'));
    const floorVal = parseFloat(stock.floor.replace(',','.'));
    if (S.vGia > ceilVal || S.vGia < floorVal) {
      showErrToast('errGia', 'Lỗi nằm ngoài trần sàn');
    } else {
      hideErrToast('errGia');
    }
  } else {
    hideErrToast('errGia');
  }
}

/* Submission-time check — returns true if order can proceed */
function validateOrder(side) {
  realtimeValidate();
  const klErr = document.getElementById('errKL');
  const giaErr = document.getElementById('errGia');
  const hasKLErr = klErr && klErr.classList.contains('show');
  const hasGiaErr = giaErr && giaErr.classList.contains('show');
  return !(hasKLErr || hasGiaErr);
}

/* ─── CONFIRM ─── */
function openConfirm(side){
  /* ── Validate before opening confirm ── */
  if (!validateOrder(side)) {
    const sideLabel = side === 'MUA' ? 'mua' : 'bán';
    showTopToast(`Đặt lệnh ${sideLabel} không thành công. Vui lòng thử lại.`);
    return;
  }

  S.oSide = side;
  const kl = S.vKL || 0;

  /* ── Populate header ── */
  document.getElementById('cfmTitle').textContent =
    side === 'MUA' ? 'Xác nhận lệnh mua' : 'Xác nhận lệnh bán';
  document.getElementById('cfmBadge').textContent = S.tkLbl.replace('TK ', 'Tiểu khoản ');
  document.getElementById('cfmCode').textContent = S.selectedStock;

  /* ── Price rows ── */
  const isCond = !['LO','MTL','MOK','MAK','ATC','PLO'].includes(S.orderType);
  const isMarket = ['MTL','ATO','ATC'].includes(S.chip);

  const priceText = isMarket ? S.chip : (S.vGia > 0 ? formatPrice(S.vGia) : '—');
  document.getElementById('cfmGia').textContent = priceText;

  const isTextPrice = isMarket || !S.vGia;
  let priceVal = isTextPrice
    ? parseFloat(STOCKS[S.selectedStock].ref.replace(',', '.'))
    : S.vGia;

  // Reset optional rows
  ['cfmRowGiaKH','cfmRowChotLai','cfmRowCutLoss'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('cfmRowGia').style.display = 'flex';

  if (S.orderType === 'Stop') {
    document.getElementById('cfmRowGiaKH').style.display = 'flex';
    document.getElementById('cfmGiaKH').textContent =
      formatPrice(S.vGiaKH) + ' (ĐK: ' + (S.cond==='ge'?'≥':'≤') + ')';
  } else if (S.orderType === 'TCO') {
    document.getElementById('cfmRowChotLai').style.display = S.vChotLai ? 'flex' : 'none';
    document.getElementById('cfmRowCutLoss').style.display = S.vCutLoss ? 'flex' : 'none';
    document.getElementById('cfmChotLai').textContent = S.vChotLai ? formatPrice(S.vChotLai) : '—';
    document.getElementById('cfmCutLoss').textContent = S.vCutLoss ? formatPrice(S.vCutLoss) : '—';
  } else if (S.orderType === 'OCO') {
    document.getElementById('cfmRowGia').style.display = 'none';
    document.getElementById('cfmRowGiaKH').style.display = 'flex';
    document.getElementById('cfmGiaKH').textContent = formatPrice(S.vGiaKH);
    document.getElementById('cfmRowChotLai').style.display = 'flex';
    document.getElementById('cfmRowCutLoss').style.display = 'flex';
    document.getElementById('cfmChotLai').textContent = S.vChotLai ? formatPrice(S.vChotLai) : '—';
    document.getElementById('cfmCutLoss').textContent = S.vCutLoss ? formatPrice(S.vCutLoss) : '—';
    priceVal = S.vChotLai || S.vCutLoss || parseFloat(STOCKS[S.selectedStock].price.replace(',','.'));
  } else if (S.orderType === 'Bull Bear') {
    document.getElementById('cfmRowGiaKH').style.display = 'flex';
    document.getElementById('cfmGiaKH').textContent = formatPrice(S.vGiaKH);
    document.getElementById('cfmRowChotLai').style.display = 'flex';
    document.getElementById('cfmRowCutLoss').style.display = 'flex';
    document.getElementById('cfmChotLai').textContent = S.vChotLai ? formatPrice(S.vChotLai) : '—';
    document.getElementById('cfmCutLoss').textContent = S.vCutLoss ? formatPrice(S.vCutLoss) : '—';
  }

  document.getElementById('cfmKL').textContent =
    (kl > 0 ? kl.toLocaleString('vi-VN') : '0') + ' CP';

  /* VAL: text price → show '--' for order value */
  if (isTextPrice) {
    document.getElementById('cfmGtri').textContent = '--';
  } else {
    document.getElementById('cfmGtri').textContent =
      (kl * priceVal * 1000).toLocaleString('vi-VN') + ' VND';
  }

  dismissKB();
  openOv('ovConfirm');
}

function confirmOrder(){
  const side=S.oSide;
  const klFmt=S.vKL > 0 ? S.vKL.toLocaleString('vi-VN') : '0';
  const isCond = !['LO','MTL','MOK','MAK','ATC','PLO'].includes(S.orderType);
  const isMarket = ['MTL','ATO','ATC'].includes(S.chip);
  
  let orderPrice = isMarket ? S.chip : (S.vGia > 0 ? formatPrice(S.vGia) : '—');
  let statusText = 'wait';
  let typeLabel = isCond ? S.orderType : S.chip;
  
  if (isCond) { statusText = 'conditional'; }
  
  if (S.orderType === 'Stop') {
    orderPrice = `${formatPrice(S.vGia)} (kích hoạt ${S.cond==='ge'?'≥':'≤'}${formatPrice(S.vGiaKH)})`;
  } else if (S.orderType === 'TCO') {
    orderPrice = `${formatPrice(S.vGia)} (Chốt: ${S.vChotLai ? formatPrice(S.vChotLai) : '—'}, Cắt: ${S.vCutLoss ? formatPrice(S.vCutLoss) : '—'})`;
  } else if (S.orderType === 'OCO') {
    orderPrice = `OCO (Chốt: ${S.vChotLai ? formatPrice(S.vChotLai) : '—'}, Cắt: ${S.vCutLoss ? formatPrice(S.vCutLoss) : '—'}, KH: ${formatPrice(S.vGiaKH)})`;
  } else if (S.orderType === 'Bull Bear') {
    orderPrice = `${formatPrice(S.vGia)} (Chốt: ${S.vChotLai ? formatPrice(S.vChotLai) : '—'}, Cắt: ${S.vCutLoss ? formatPrice(S.vCutLoss) : '—'}, KH: ${formatPrice(S.vGiaKH)})`;
  }
  
  S.orders.unshift({
    id: S.nid++, side: side==='MUA'?'buy':'sell',
    code: S.selectedStock, st: statusText,
    p: orderPrice, mp: '—', mq: '0', q: klFmt, type: typeLabel
  });
  
  closeOv('ovConfirm');
  S.vKL=0; S.vGia=0; S.vGiaKH=0; S.vChotLai=0; S.vCutLoss=0; S.editString='';
  renF('KL'); renF('Gia'); renF('GiaKH'); renF('ChotLai'); renF('CutLoss');
  renderOrders();
  showTopToast('Đặt lệnh thành công.', 'success');
  if (isCond) {
    filtO('conditional', document.querySelectorAll('.fc')[3]);
  } else {
    filtO('all', document.querySelectorAll('.fc')[0]);
  }
  switchTab(1);
  dismissKB();
  setTimeout(()=>document.getElementById('bd').scrollTo({top:9999,behavior:'smooth'}),400);
}

/* ─── LOẠI LỆNH SHEET ─── */
let _lTab=1;
function lTab(t){
  _lTab=t;
  document.getElementById('lt1').classList.toggle('on',t===1);
  document.getElementById('lt2').classList.toggle('on',t===2);
  document.getElementById('lp1').style.display=t===1?'block':'none';
  document.getElementById('lp2').style.display=t===2?'block':'none';
}
function selLenh(display,code){
  const isCond = !['LO','MTL','MOK','MAK','ATC','PLO'].includes(code);
  document.getElementById('lenhLabel').textContent = isCond ? 'Lệnh ĐK' : 'Lệnh thường';
  
  S.orderType = code;
  S.chip = (['LO','MTL','ATO','ATC'].includes(code)) ? code : 'LO';
  
  S.vGiaKH = 0;
  S.vChotLai = 0;
  S.vCutLoss = 0;
  S.editString = '';
  
  selChip(S.chip);
  
  if(isCond){
    document.getElementById('cLO').textContent = code;
    document.getElementById('cMTL').textContent = 'Auto';
    document.getElementById('cLO').classList.add('on');
    document.getElementById('cMTL').classList.remove('on');
  } else {
    document.getElementById('cLO').textContent = 'LO';
    document.getElementById('cMTL').textContent = 'MTL';
    selChip(code);
  }
  
  updateOrderFormLayout();
  
  closeOv('ovLenh');
  showToast('Đã chọn: ' + display);
}

function updateOrderFormLayout() {
  const type = S.orderType;
  
  const rowGiaKH = document.getElementById('rowGiaKH');
  const rowChotLaiCutLoss = document.getElementById('rowChotLaiCutLoss');
  const rowHieuLuc = document.getElementById('rowHieuLuc');
  const qfGia = document.getElementById('qfGia');
  
  rowGiaKH.style.display = 'none';
  rowChotLaiCutLoss.style.display = 'none';
  rowHieuLuc.style.display = 'none';
  qfGia.style.display = 'block';
  
  const lblGia = document.getElementById('lblGia');
  lblGia.textContent = 'Giá đặt';
  
  if (type === 'Stop') {
    rowGiaKH.style.display = 'flex';
    rowHieuLuc.style.display = 'flex';
  } else if (type === 'TCO') {
    rowChotLaiCutLoss.style.display = 'flex';
    rowHieuLuc.style.display = 'flex';
  } else if (type === 'OCO') {
    rowGiaKH.style.display = 'flex';
    rowChotLaiCutLoss.style.display = 'flex';
    rowHieuLuc.style.display = 'flex';
    qfGia.style.display = 'none';
  } else if (type === 'Bull Bear') {
    rowGiaKH.style.display = 'flex';
    rowChotLaiCutLoss.style.display = 'flex';
    rowHieuLuc.style.display = 'flex';
    lblGia.textContent = 'Giá đặt mua';
  }
  
  renF('KL');
  renF('Gia');
  renF('GiaKH');
  renF('ChotLai');
  renF('CutLoss');
}

function selCond(val) {
  S.cond = val;
  document.getElementById('condGe').classList.toggle('on', val === 'ge');
  document.getElementById('condLe').classList.toggle('on', val === 'le');
}

function onDateChange(val) {
  S.hieuLuc = val;
}

/* ─── TK SHEET ─── */
function selTK(lbl,full){
  S.tkLbl=lbl;
  document.getElementById('tkLabel').textContent=lbl;
  closeOv('ovTK');
  showToast('Đã chọn: '+full);
}

/* ─── TOAST ─── */
let _tt;
function showToast(msg){
  clearTimeout(_tt);
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.classList.add('show');
  _tt=setTimeout(()=>t.classList.remove('show'),2800);
}

/* ─── TABS ─── */
function switchTab(n){
  S.curTab=n;
  document.getElementById('tab1').classList.toggle('on',n===1);
  document.getElementById('tab2').classList.toggle('on',n===2);
  document.getElementById('panelOrders').style.display=n===1?'block':'none';
  document.getElementById('panelDM').style.display=n===2?'block':'none';
}

/* ─── DESTRUCTIVE ACTIONS CONFIRM OVERLAYS ─── */
function showCancelAllConfirm() {
  const activeOrders = S.orders.filter(o => o.st === 'wait' || o.st === 'partial' || o.st === 'conditional');
  if (activeOrders.length === 0) {
    showToast('Không có lệnh chờ nào để huỷ');
    return;
  }
  document.getElementById('massConfirmTitle').textContent = 'Xác nhận huỷ lệnh';
  document.getElementById('massConfirmMsg').textContent = `Bạn có chắc chắn muốn huỷ tất cả ${activeOrders.length} lệnh đang chờ không?`;
  const btn = document.getElementById('massConfirmBtn');
  btn.onclick = function() {
    cancelAll();
    closeOv('ovMassConfirm');
  };
  openOv('ovMassConfirm');
}

/* Một mã trong danh mục đủ điều kiện bán-tất-cả nếu hệ thống xác định được giá sàn của nó */
function isEligibleForSellAll(p) {
  return !!STOCKS[p.code];
}

function showSellAllConfirm() {
  if (S.portfolio.length === 0) {
    showToast('Danh mục trống');
    return;
  }
  const total = S.portfolio.length;
  const eligibleList = S.portfolio.filter(isEligibleForSellAll);
  const eligible = eligibleList.length;
  const totalVal = eligibleList.reduce((sum, p) => {
    const floorPrice = parseFloat(STOCKS[p.code].floor.replace(',','.'));
    return sum + (p.qty * floorPrice * 1000);
  }, 0);
  document.getElementById('saSubBadge').textContent = S.tkLbl.replace('TK ', 'Tiểu khoản ');
  document.getElementById('saEligible').textContent = `${eligible}/${total}`;
  const confirmBtn = document.getElementById('saConfirmBtn');
  if (confirmBtn) confirmBtn.disabled = eligible === 0;
  document.getElementById('saGtri').textContent = totalVal > 0
    ? totalVal.toLocaleString('vi-VN') + ' VND' : '--';
  openOv('ovSellAll');
}

function doSellAll() {
  closeOv('ovSellAll');
  sellAllPortfolio();
}

function approveAllConfirm() {
  const pendingApprovals = slnXN.filter(x => x.pct === 'Chờ duyệt');
  if (pendingApprovals.length === 0) {
    showToast('Không có lệnh nào chờ duyệt');
    return;
  }
  document.getElementById('massConfirmTitle').textContent = 'Duyệt tất cả lệnh';
  document.getElementById('massConfirmMsg').textContent = `Bạn có chắc chắn muốn duyệt toàn bộ ${pendingApprovals.length} lệnh đang chờ duyệt không?`;
  const btn = document.getElementById('massConfirmBtn');
  btn.onclick = function() {
    slnXN.forEach(x => {
      if (x.pct === 'Chờ duyệt') {
        x.pct = 'Đã duyệt';
      }
    });
    renderSLN2();
    closeOv('ovMassConfirm');
    showToast('Đã duyệt toàn bộ lệnh thành công');
  };
  openOv('ovMassConfirm');
}

/* ─── ORDER FILTER / CANCEL ─── */
function filtO(f,el){
  S.filter=f;
  document.querySelectorAll('.fc').forEach(x=>{x.classList.remove('on');x.classList.add('off');});
  el.classList.add('on'); el.classList.remove('off');
  renderOrders();
}
function cancelAll(){
  S.orders.forEach(o=>{
    if(o.st==='wait'||o.st==='partial'||o.st==='conditional') o.st='cancel';
  });
  renderOrders(); 
  renderSLN0();
  renderSLN1();
  showToast('Đã huỷ tất cả lệnh chờ');
}
function cancelOne(id){
  const o=S.orders.find(x=>x.id===id);
  if(o&&(o.st==='wait'||o.st==='partial'||o.st==='conditional'))o.st='cancel';
  renderOrders();
  renderSLN0();
  renderSLN1();
}

/* ─── RENDER ORDERS ─── */
const SL={wait:'Chờ khớp',partial:'Khớp 1 phần',filled:'Khớp hoàn toàn',cancel:'Huỷ',conditional:'Chờ kích hoạt'};
const SC={wait:'wt',partial:'pt',filled:'ft',cancel:'ct',conditional:'wt'};
function renderOrders(){
  let os=[...S.orders];
  if(S.filter==='pending')os=os.filter(o=>o.st==='wait'||o.st==='partial');
  if(S.filter==='filled')os=os.filter(o=>o.st==='filled');
  if(S.filter==='conditional')os=os.filter(o=>o.st==='conditional');
  const el=document.getElementById('cardList');
  if(!os.length){el.innerHTML='<div style="padding:24px;text-align:center;font-size:12px;color:#aaa">Không có lệnh nào</div>';return;}
  el.innerHTML=os.map(o=>`
    <div class="card">
      <div class="chd">
        <div class="bsi ${o.side==='buy'?'b':'s'}">${o.side==='buy'?'M':'B'}</div>
        <span class="ccode">${o.code}</span>
        <span class="stag ${SC[o.st]}">${SL[o.st]}</span>
      </div>
      <div class="thn"></div>
      <div class="cbd">
        <div class="cgrid">
          <div class="ccl"><span class="cclb">Giá</span><span class="ccv">${o.p}</span></div>
          <div class="ccl"><span class="cclb">Giá khớp/đặt</span><span class="ccv">${o.mp}<br><span class="den">/${o.p}</span></span></div>
          <div class="ccl"><span class="cclb">SL khớp/đặt</span><span class="ccv"><strong>${o.mq}</strong><br><span class="den">/${o.q} CP</span></span></div>
        </div>
        <div class="cac">${(o.st==='wait'||o.st==='partial'||o.st==='conditional')?`
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="cursor:pointer"><path d="M13.5 3.5a2 2 0 0 1 2.83 2.83L7 15.67l-3.5.83.83-3.5L13.5 3.5z" stroke="#707070" stroke-width="1.3" stroke-linejoin="round"/></svg>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="cursor:pointer" onclick="cancelOne(${o.id})"><path d="M4 4l12 12M16 4L4 16" stroke="#ff1f1f" stroke-width="1.5" stroke-linecap="round"/></svg>
        `:''}</div>
      </div>
    </div>`).join('');
}

/* ─── RENDER PORTFOLIO ─── */
function renderDM(){
  const el=document.getElementById('dmList');
  if(!S.portfolio.length){el.innerHTML='<div class="dm-empty">Chưa có cổ phiếu nào</div>';return;}
  el.innerHTML=S.portfolio.map(p=>{
    const isPos=p.plPct.startsWith('+');
    const cls=isPos?'gn':'rd';
    const plCls=p.plDay.startsWith('+')?'gn':(p.plDay.startsWith('-')?'rd':'bl');
    const arrow=isPos
      ?`<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 2L8.5 7H1.5z" fill="#10bf2d"/></svg>`
      :`<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 8L1.5 3H8.5z" fill="#ff1f1f"/></svg>`;
      
    const curVal = parseFloat(p.price.replace(',', '.'));
    const avgVal = parseFloat(p.avg.replace(',', '.'));
    let curCls = 'ye';
    if (curVal > avgVal) curCls = 'gn';
    else if (curVal < avgVal) curCls = 'rd';
    
    return`<div class="dm-card">
      <div class="dm-card-hd">
        <span class="dm-card-code">${p.code}</span>
        <span class="dm-tag ${cls}">${arrow} ${p.plPct}</span>
        <span class="dm-sell-btn" onclick="sellPortfolioStock('${p.code}', ${p.qty})">Bán</span>
      </div>
      <div class="dm-divider"></div>
      <div class="dm-data">
        <div class="dm-data-row"><span class="l">Lãi/Lỗ</span><span class="v ${cls}">${p.plAbs}</span></div>
        <div class="dm-data-row"><span class="l">Lãi/Lỗ trong ngày</span><span class="v ${plCls}">${p.plDay}</span></div>
        <div class="dm-data-row">
          <span class="l">Giá hiện tại/Giá vốn</span>
          <span class="v" style="font-weight:700">
            <span class="dm-cur-price" style="color: var(--${curCls})">${p.price}</span> / <span class="dm-avg-price" style="color: var(--t2); font-weight: 400">${p.avg}</span>
          </span>
        </div>
        <div class="dm-data-row"><span class="l">KL GD/Tổng KL</span><span class="v t1">${p.qty.toLocaleString('vi-VN')}/${p.total.toLocaleString('vi-VN')}</span></div>
      </div>
    </div>`;
  }).join('');
}

function sellPortfolioStock(code, qty) {
  selectStock(code);
  S.vKL = qty;
  renF('KL');
  focF('Gia');
  showToast('Đã chọn ' + code + ' với khối lượng ' + qty.toLocaleString('vi-VN'));
}

function sellAllPortfolio() {
  const eligibleList = S.portfolio.filter(isEligibleForSellAll);
  if (eligibleList.length === 0) {
    showToast('Danh mục trống');
    return;
  }
  eligibleList.forEach(p => {
    const qtyFmt = p.qty.toLocaleString('vi-VN');
    S.orders.unshift({
      id: S.nid++,
      side: 'sell',
      code: p.code,
      st: 'wait',
      p: STOCKS[p.code].floor,
      mp: '—',
      mq: '0',
      q: qtyFmt,
      type: 'LO'
    });
  });
  S.portfolio = S.portfolio.filter(p => !isEligibleForSellAll(p));
  renderOrders();
  renderDM();
  showTopToast('Đặt lệnh thành công.', 'success');
  switchTab(1);
}

/* ─── NAV ─── */
function navCk(el){document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));el.classList.add('on');}

/* ─── SỔ LỆNH NÂNG CAO ─── */
function openSLN(){
  slnSeg(0, document.querySelectorAll('.sln-seg-item')[0]);
  openOv('ovSLN');
}
function slnSeg(n, el){
  document.querySelectorAll('.sln-seg-item').forEach(s=>s.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('.sln-panel').forEach((p,i)=>{p.classList.toggle('on',i===n);});
  if(n===0) renderSLN0();
  if(n===1) renderSLN1();
  if(n===2) renderSLN2();
}

function renderSLN0(){
  const el=document.getElementById('slnCards0');
  const os=[...S.orders];
  if(!os.length){el.innerHTML='<div style="padding:24px;text-align:center;font-size:12px;color:#aaa">Không có lệnh nào</div>';return;}
  el.innerHTML=os.map(o=>`
    <div class="sln-ocard">
      <div class="sln-ocard-hd">
        <div class="bsi ${o.side==='buy'?'b':'s'}">${o.side==='buy'?'M':'B'}</div>
        <span class="sln-ocard-code">${o.code}</span>
        <span class="sln-ocard-tag ${SC[o.st]}">${SL[o.st]}</span>
      </div>
      <div class="sln-ocard-divider"></div>
      <div class="sln-ocard-body">
        <div class="sln-ocard-grid">
          <div class="sln-ocard-col"><span class="l">Giá</span><span class="v">${o.p}</span></div>
          <div class="sln-ocard-col"><span class="l">Giá khớp/đặt</span><span class="v">${o.mp}<br><span class="den">/${o.p}</span></span></div>
          <div class="sln-ocard-col"><span class="l">SL khớp/đặt</span><span class="v"><strong>${o.mq}</strong><br><span class="den">/${o.q} CP</span></span></div>
        </div>
        <div class="sln-ocard-act">${(o.st==='wait'||o.st==='partial')?`
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="cursor:pointer"><path d="M13.5 3.5a2 2 0 0 1 2.83 2.83L7 15.67l-3.5.83.83-3.5z" stroke="#070707" stroke-width="1.3" stroke-linejoin="round"/></svg>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="cursor:pointer" onclick="cancelOne(${o.id})"><path d="M4 4l12 12M16 4L4 16" stroke="#ff1f1f" stroke-width="1.5" stroke-linecap="round"/></svg>`:''}</div>
      </div>
    </div>`).join('');
}

const slnDK = [
  {side:'buy',code:'HPG',tag:'TCO',tagCls:'gray',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá chốt lãi',v:'28,50',vc:'gn'},
    {l:'Giá kích hoạt/Giá cắt lỗ',v:'27,60/24,55'},{l:'Hiệu lực',v:'28/05/2026 - 28/05/2026'}]},
  {side:'sell',code:'HPG',tag:'TCO',tagCls:'gray',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá chốt lãi',v:'28,50',vc:'gn'},
    {l:'Giá kích hoạt/Giá cắt lỗ',v:'27,60/24,55'},{l:'Hiệu lực',v:'28/05/2026 - 28/05/2026'}]},
  {side:'buy',code:'HPG',tag:'TCO',tagCls:'gray',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá chốt lãi',v:'28,50',vc:'gn'},
    {l:'Giá kích hoạt/Giá cắt lỗ',v:'27,60/24,55'},{l:'Hiệu lực',v:'28/05/2026 - 28/05/2026'}]},
  {side:'sell',code:'HPG',tag:'TCO',tagCls:'gray',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá chốt lãi',v:'28,50',vc:'gn'},
    {l:'Giá kích hoạt/Giá cắt lỗ',v:'27,60/24,55'},{l:'Hiệu lực',v:'28/05/2026 - 28/05/2026'}]}
];
function renderSLN1(){
  const el=document.getElementById('slnCards1');
  el.innerHTML=slnDK.map(c=>{
    const side=c.side==='buy';
    return `<div class="sln-ocard">
      <div class="sln-ocard-hd">
        <div class="bsi ${side?'b':'s'}">${side?'M':'B'}</div>
        <span class="sln-ocard-tag ${c.tagCls}">${c.tag}</span>
        <span class="sln-ocard-code">${c.code}</span>
        <span class="sln-ocard-spacer"></span>
        <span class="sln-btn-huy" onclick="showCancelAllConfirm()">Huỷ</span>
      </div>
      <div class="sln-ocard-divider"></div>
      <div class="sln-ocard-body">${c.rows.map(r=>`
        <div class="sln-ocard-row"><span class="l">${r.l}</span><span class="v${r.vc?' '+r.vc:''}">${r.v}</span></div>`).join('')}
      </div>
    </div>`;}).join('');
}

const slnXN = [
  {side:'buy',pct:'52%',code:'HPG',tag:'13:49 28/05',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá đặt',v:'27,75'},{l:'Người đặt',v:'Thu Trang'},{l:'Thời gian đặt lệnh',v:'13:49:23 - 28/05/2026'}]},
  {side:'buy',pct:'Chờ duyệt',code:'HPG',tag:'13:49 28/05',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá đặt',v:'27,75'},{l:'Người đặt',v:'Thu Trang'},{l:'Thời gian đặt lệnh',v:'13:49:23 - 28/05/2026'}]},
  {side:'buy',pct:'Chờ duyệt',code:'HPG',tag:'13:49 28/05',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá đặt',v:'27,75'},{l:'Người đặt',v:'Thu Trang'},{l:'Thời gian đặt lệnh',v:'13:49:23 - 28/05/2026'}]},
  {side:'sell',pct:'Bán',code:'HPG',tag:'13:49 28/05',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá đặt',v:'27,75'},{l:'Người đặt',v:'Thu Trang'},{l:'Thời gian đặt lệnh',v:'13:49:23 - 28/05/2026'}]},
  {side:'sell',pct:'Từ chối',code:'HPG',tag:'13:49 28/05',rows:[
    {l:'KL đặt',v:'1000'},{l:'Giá đặt',v:'27,75'},{l:'Người đặt',v:'Thu Trang'},{l:'Thời gian đặt lệnh',v:'13:49:23 - 28/05/2026'}]}
];
function renderSLN2(){
  const el=document.getElementById('slnCards2');
  el.innerHTML=slnXN.map(c=>{
    const side=c.side==='buy';
    const pctCls=side?'gn':'rd';
    return `<div class="sln-ocard">
      <div class="sln-ocard-hd">
        <span class="sln-ocard-tag ${pctCls}">${c.pct}</span>
        <span class="sln-ocard-code">${c.code}</span>
        <span class="sln-ocard-tag gray">${c.tag}</span>
        <span class="sln-ocard-spacer"></span>
        ${c.pct==='Chờ duyệt'?`<span class="sln-btn-duyet" onclick="approveAllConfirm()">Duyệt</span>`:''}
      </div>
      <div class="sln-ocard-divider"></div>
      <div class="sln-ocard-body">${c.rows.map(r=>`
        <div class="sln-ocard-row"><span class="l">${r.l}</span><span class="v">${r.v}</span></div>`).join('')}
      </div>
    </div>`;}).join('');
}

function openFlt(){document.getElementById('slnFltOv').classList.add('open');}
function closeFlt(){document.getElementById('slnFltOv').classList.remove('open');}
function fltChip(el){
  const grp=el.parentElement.dataset.grp;
  if(grp=='status'){
    if(el.textContent==='Tất cả'){
      el.parentElement.querySelectorAll('.sln-flt-c').forEach(c=>{c.classList.remove('on');c.classList.add('off');});
      el.classList.add('on');el.classList.remove('off');
    } else {
      el.parentElement.querySelector('.sln-flt-c').classList.remove('on');
      el.parentElement.querySelector('.sln-flt-c').classList.add('off');
      el.classList.toggle('on');el.classList.toggle('off');
    }
  } else {
    el.parentElement.querySelectorAll('.sln-flt-c').forEach(c=>{c.classList.remove('on');c.classList.add('off');});
    el.classList.add('on');el.classList.remove('off');
  }
}
function resetFlt(){
  document.querySelectorAll('.sln-flt-chips').forEach(g=>{
    g.querySelectorAll('.sln-flt-c').forEach((c,i)=>{
      c.classList.remove('on','off');
      c.classList.add(i===0?'on':'off');
    });
  });
}
function applyFlt(){closeFlt();showToast('Đã áp dụng bộ lọc');}

function slnFilt(el){
  el.parentElement.querySelectorAll('.fc').forEach(c=>{c.classList.remove('on');c.classList.add('off');});
  el.classList.add('on');el.classList.remove('off');
}

/* ─── INIT ─── */
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const defaultDate = `${yyyy}-${mm}-${dd}`;
const hDateEl = document.getElementById('hieuLucDate');
if (hDateEl) {
  hDateEl.value = defaultDate;
}
S.hieuLuc = defaultDate;

renF('KL');
renF('Gia');
updateOrderBook(S.selectedStock);
renderOrders();
renderDM();
renderSearchHistoryCards();
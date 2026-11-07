(() => {
  const segments = [
    { id: 'commuters', name: '5AM Commuters', icon: '☼', note: 'Up before the sun', interest: 31, excitement: 22 },
    { id: 'families', name: 'Family Wagons', icon: '⌂', note: 'Clean car, happy kids', interest: 38, excitement: 26 },
    { id: 'enthusiasts', name: 'Car Enthusiasts', icon: '✦', note: 'Every detail matters', interest: 22, excitement: 28 },
    { id: 'dealhunters', name: 'Deal Hunters', icon: '＄', note: 'Value is the vibe', interest: 34, excitement: 20 },
    { id: 'nightowls', name: 'Night Owls', icon: '☾', note: 'Late shift, late wash', interest: 18, excitement: 19 }
  ];
  const brands = [
    { id: 'neighborhood', name: 'Bubble Base', icon: '🫧', desc: 'Friendly neighborhood clean.', effect: 'ALL-ROUNDER', lift: [1, 2, 1, 1, 0], color: '#b5db72' },
    { id: 'dawn', name: 'Dawn Patrol', icon: '☀️', desc: 'Fresh cars before first light.', effect: 'COMMUTER MAGNET', lift: [11, -1, 0, 0, -2], color: '#f5bc67' },
    { id: 'showtime', name: 'Foam & Fame', icon: '✨', desc: 'Big lights. Bigger suds. Showtime.', effect: 'BUZZ BUILDER', lift: [0, 2, 8, 0, 5], color: '#ea9bbc' },
    { id: 'value', name: 'The Clean Machine', icon: '⚙️', desc: 'No frills. No surprises. Good value.', effect: 'BUDGET FAVORITE', lift: [0, 1, -2, 10, 0], color: '#8ebeff' }
  ];
  const hours = [
    { value: 5, label: '5:00 AM', customers: 1.24, wage: 210, bonus: 12, note: 'Early opening catches the commuter rush. A longer shift means higher staffing costs.' },
    { value: 7, label: '7:00 AM', customers: 1.08, wage: 155, bonus: 6, note: 'A little head start for the morning crowd, with a manageable staff bill.' },
    { value: 9, label: '9:00 AM', customers: .94, wage: 115, bonus: 0, note: 'A sensible start. You will miss some early commuters, but save on staffing.' },
    { value: 11, label: '11:00 AM', customers: .78, wage: 85, bonus: -4, note: 'Keep payroll low and focus on midday customers.' }
  ];
  const locations = [
    { name: 'RIVERFRONT', cost: 8000, factor: 1.15 },
    { name: 'MILL DISTRICT', cost: 10500, factor: 1.05 },
    { name: 'OAK HOLLOW', cost: 12000, factor: .96 },
    { name: 'AIRPORT ROW', cost: 15000, factor: 1.2 },
    { name: 'SUNSET PLAZA', cost: 18000, factor: 1.1 }
  ];
  const state = {
    day: 1, cash: 12500, buzz: 24, selected: 0, ended: false, lastNet: 0,
    outlets: [{ name: 'BUBBLE BASE', location: 'DOWNTOWN', brand: 'neighborhood', hour: 7, tier: 1, factor: 1, audiences: segments.map(s => ({ interest: s.interest, excitement: s.excitement })), totalCustomers: 0 }],
    ledger: [],
    dailyWeather: ['Clear skies', 'Cloudy, but dry', 'A little drizzle', 'Perfect wash weather', 'Windy on the avenue', 'Blue-sky special', 'Passing showers']
  };
  const $ = id => document.getElementById(id);
  let toastTimer;
  const selectedOutlet = () => state.outlets[state.selected];
  const currentBrand = outlet => brands.find(b => b.id === outlet.brand);
  const currentHours = outlet => hours.find(h => h.value === Number(outlet.hour));
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
  const pad = n => String(n).padStart(2, '0');

  function showToast(message) {
    const toast = $('toast'); toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  function updateHud() {
    $('dayStat').innerHTML = `${pad(Math.min(state.day, 30))}<span class="stat-dim"> / 30</span>`;
    $('cashStat').textContent = money(state.cash);
    $('cashDelta').textContent = state.ledger.length ? `${state.lastNet >= 0 ? '+' : '−'}${money(Math.abs(state.lastNet))} LAST DAY` : 'READY TO ROLL';
    $('cashDelta').style.color = state.lastNet < 0 ? '#f09a72' : '';
    $('buzzStat').innerHTML = `${state.buzz}<span class="stat-dim"> / 100</span>`;
    $('buzzMeter').style.width = `${state.buzz}%`;
    $('dayProgress').style.width = `${Math.min(100, (state.day - 1) / 30 * 100)}%`;
    $('washCount').textContent = pad(state.outlets.length);
    const expandCost = state.outlets.length === 1 ? 8000 : 8000 + (state.outlets.length - 1) * 2500;
    $('expandBtn').disabled = state.outlets.length >= 6 || state.cash < expandCost;
    $('expandBtn').style.opacity = $('expandBtn').disabled ? '.52' : '1';
    const subline = $('expandBtn').querySelector('small');
    if (subline) subline.textContent = state.outlets.length >= 6 ? 'NETWORK AT CAPACITY' : `${money(expandCost)} • EXPAND THE MAP`;
  }
  function renderOutlets() {
    $('outletList').innerHTML = state.outlets.map((o, i) => `<div class="outlet-item ${i === state.selected ? 'active' : ''}" data-outlet="${i}"><div class="outlet-item-left"><span class="outlet-icon">${i === 0 ? '▤' : '▥'}</span><div><b>${o.name}</b><small>${o.location} · TIER ${o.tier}</small></div></div><span class="outlet-cash">${money(o.totalCustomers)}<small style="display:block;font-size:7px;color:#99a198;text-align:right">CARS</small></span></div>`).join('');
    document.querySelectorAll('.outlet-item').forEach(el => el.addEventListener('click', () => { state.selected = Number(el.dataset.outlet); render(); }));
    const expandCost = state.outlets.length === 1 ? 8000 : 8000 + (state.outlets.length - 1) * 2500;
    $('expandBtn').disabled = state.outlets.length >= 6 || state.cash < expandCost;
    $('expandBtn').style.opacity = $('expandBtn').disabled ? '.52' : '1';
  }
  function renderStrategy() {
    const o = selectedOutlet();
    $('outletId').textContent = pad(state.selected + 1);
    $('outletName').textContent = o.name;
    $('outletLocation').textContent = `${o.location} • ${state.day === 1 ? 'EST. TODAY' : `OPERATING ${state.day - 1} DAYS`}`;
    $('brandChoices').innerHTML = brands.map(b => `<label class="brand-choice ${o.brand === b.id ? 'selected' : ''}"><input type="radio" name="brand" value="${b.id}" ${o.brand === b.id ? 'checked' : ''}><span class="brand-emoji">${b.icon}</span><span><b>${b.name}</b><small>${b.desc}</small></span><span class="brand-effect">${b.effect}</span></label>`).join('');
    document.querySelectorAll('input[name="brand"]').forEach(input => input.addEventListener('change', () => { o.brand = input.value; render(); }));
    $('hoursSelect').innerHTML = hours.map(h => `<option value="${h.value}" ${Number(o.hour) === h.value ? 'selected' : ''}>${h.label}${h.value === 5 ? '  ·  EARLY BIRD' : ''}</option>`).join('');
    $('hoursSelect').onchange = e => { o.hour = Number(e.target.value); render(); };
    $('hoursNote').textContent = currentHours(o).note;
    const cost = o.tier === 1 ? 2400 : 4700;
    $('tierLevel').textContent = `TIER ${o.tier} / 3`;
    $('tierDesc').textContent = ['Reliable brushes, honest work.', 'Softer foam, better finish.', 'Top-shelf shine. The word gets around.'][o.tier - 1];
    $('upgradeCost').textContent = money(cost);
    $('upgradeBtn').disabled = o.tier >= 3 || state.cash < cost;
    $('upgradeBtn').childNodes[0].textContent = o.tier >= 3 ? 'MAXED OUT ' : 'UPGRADE ';
    $('upgradeCost').hidden = o.tier >= 3;
    $('upgradeBtn').onclick = upgrade;
    $('playSummary').textContent = `${currentBrand(o).name} opens at ${currentHours(o).label}. ${currentBrand(o).effect.toLowerCase()} — run the day and see who shows up.`;
    const quality = $('qualityBars'); quality.innerHTML = '';
  }
  function renderAudience() {
    const outlet = selectedOutlet();
    $('audienceList').innerHTML = segments.map((segment, i) => {
      const a = outlet.audiences[i];
      const score = Math.round(a.interest * .58 + a.excitement * .42);
      return `<div class="audience-row"><div class="segment-name"><span class="segment-icon">${segment.icon}</span><span><b>${segment.name}</b><small>${segment.note}</small></span></div><div class="segment-bars"><div class="bar-line"><span>INTEREST</span><div class="bar-track"><div class="bar-fill" style="width:${a.interest}%"></div></div></div><div class="bar-line"><span>EXCITEMENT</span><div class="bar-track"><div class="bar-fill excitement" style="width:${a.excitement}%"></div></div></div></div><div class="audience-score"><strong>${score}<span style="font-size:9px;color:#829087">/100</span></strong>RESPONSE</div></div>`;
    }).join('');
  }
  function renderLedger() {
    $('ledgerTotal').textContent = `${state.lastNet >= 0 ? '+' : '−'}${money(Math.abs(state.lastNet))} NET`;
    if (!state.ledger.length) {
      $('ledgerList').innerHTML = `<div style="padding:28px 12px;text-align:center;color:#8a948b;font-size:11px">No entries yet. Run your first day to see where the money went.</div>`;
      return;
    }
    $('ledgerList').innerHTML = `<div class="ledger-row header"><span>DAY</span><span>DAILY SUMMARY</span><span>VISITORS</span><span>NET</span></div>` + state.ledger.slice().reverse().map(e => `<div class="ledger-row"><span>DAY ${pad(e.day)}</span><b>${e.note}</b><span>${e.cars.toLocaleString()} cars</span><span class="${e.net >= 0 ? 'positive' : 'negative'}">${e.net >= 0 ? '+' : '−'}${money(Math.abs(e.net))}</span></div>`).join('');
  }
  function render() {
    updateHud(); renderOutlets(); renderStrategy(); renderAudience(); renderLedger();
    $('runDayBtn').disabled = state.ended;
    $('runDayBtn').style.opacity = state.ended ? '.55' : '1';
    $('runDayBtn').textContent = state.ended ? 'SEASON COMPLETE' : 'RUN THE DAY →';
  }
  function upgrade() {
    const o = selectedOutlet();
    if (o.tier >= 3) return;
    const cost = o.tier === 1 ? 2400 : 4700;
    if (state.cash < cost) return showToast('Not enough cash for that upgrade.');
    state.cash -= cost; o.tier++;
    showToast(`${o.name} upgraded to tier ${o.tier}. Shine on.`); render();
  }
  function expand() {
    if (state.outlets.length >= 6) return showToast('Six outlets — that is plenty of suds.');
    const cost = state.outlets.length === 1 ? 8000 : 8000 + (state.outlets.length - 1) * 2500;
    if (state.cash < cost) return showToast(`You need ${money(cost)} to open another wash.`);
    const loc = locations[state.outlets.length - 1] || { name: `NEW DISTRICT ${state.outlets.length}`, factor: 1 };
    state.cash -= cost;
    state.outlets.push({ name: ['RIVER BUBBLES', 'MILL STREET WASH', 'OAK & SOAP', 'JETSET SUDS', 'SUNSET SHINE'][state.outlets.length - 1] || 'FRESH COAT', location: loc.name, brand: 'neighborhood', hour: 9, tier: 1, factor: loc.factor, audiences: segments.map(s => ({ interest: s.interest, excitement: s.excitement })), totalCustomers: 0 });
    state.selected = state.outlets.length - 1;
    showToast(`New outlet opened in ${loc.name}. A whole new neighborhood.`); render();
  }
  function runDay() {
    if (state.ended || state.day > 30) return;
    const day = state.day;
    const weather = state.dailyWeather[(day - 1) % state.dailyWeather.length];
    let totalCars = 0, gross = 0, expenses = 0, satisfactionSum = 0;
    const outletReports = [];
    state.outlets.forEach(o => {
      const brand = currentBrand(o), shift = currentHours(o);
      let interestSum = 0;
      o.audiences.forEach((a, i) => {
        const brandLift = brand.lift[i];
        const hourFit = (i === 0 && o.hour <= 7) ? shift.bonus * .7 : (i === 4 && o.hour <= 7 ? -3 : 0);
        const qualityLift = (o.tier - 1) * (i === 2 ? 3 : 1.2);
        const eventLift = weather.includes('drizzle') ? (i === 1 ? 4 : -2) : 0;
        a.interest = clamp(a.interest + brandLift * .24 + hourFit * .16 + qualityLift * .22 + eventLift * .14 + (state.buzz - 24) * .014);
        a.excitement = clamp(a.excitement + brandLift * .19 + qualityLift * .5 + (brand.id === 'showtime' ? 1.3 : 0) + (weather.includes('Perfect') ? 1 : 0) - 1.5);
        interestSum += (a.interest * .62 + a.excitement * .38) * [1.2, 1.25, .75, .9, .55][i];
      });
      const potential = interestSum / 100 * 58 * shift.customers * o.factor;
      const buzzFactor = .88 + state.buzz / 190;
      const cars = Math.max(4, Math.round(potential * buzzFactor));
      const price = o.tier === 3 ? 17 : o.tier === 2 ? 15 : 13;
      const outletGross = cars * price;
      const payroll = shift.wage + (o.tier > 1 ? 20 * (o.tier - 1) : 0);
      const supplies = cars * (o.tier === 3 ? 4.1 : o.tier === 2 ? 3.5 : 3.1);
      const overhead = 65 + Math.round((o.tier - 1) * 18);
      const outletExpenses = payroll + supplies + overhead;
      const satisfaction = Math.min(100, 47 + o.tier * 11 + (brand.id === 'neighborhood' ? 4 : 0) + (cars > 50 ? 3 : 0));
      totalCars += cars; gross += outletGross; expenses += outletExpenses; satisfactionSum += satisfaction;
      o.totalCustomers += cars;
      outletReports.push({ name: o.name, cars, net: outletGross - outletExpenses });
    });
    const weatherMultiplier = weather.includes('drizzle') ? .82 : weather.includes('Perfect') ? 1.12 : 1;
    gross = Math.round(gross * weatherMultiplier);
    const net = gross - expenses;
    state.cash += net;
    const averageSatisfaction = satisfactionSum / state.outlets.length;
    const buzzChange = Math.round((averageSatisfaction - 61) / 12 + Math.min(3, totalCars / 70) + (net > 0 ? .8 : -1.5) + (weather.includes('Perfect') ? 1 : 0));
    state.buzz = clamp(state.buzz + buzzChange);
    state.lastNet = net;
    state.ledger.push({ day, cars: totalCars, net, note: `${weather} · ${state.outlets.length} ${state.outlets.length === 1 ? 'outlet' : 'outlets'}` });
    state.day++;
    render();
    const hit = outletReports.reduce((text, r) => text + `<div class="report-line"><b>${r.name}</b><span>${r.cars} cars</span><span class="${r.net >= 0 ? 'positive' : 'negative'}">${r.net >= 0 ? '+' : '−'}${money(Math.abs(r.net))}</span></div>`, '');
    showToast(`Day ${pad(day)} wrapped: ${totalCars} cars washed, ${net >= 0 ? '+' : '−'}${money(Math.abs(net))} net.`);
    if (state.day > 30) finishGame();
  }
  function finishGame() {
    state.ended = true; render();
    const won = state.cash >= 25000 && state.buzz >= 55;
    $('resultTitle').textContent = won ? 'THE WHOLE TOWN IS TALKING.' : state.cash < 0 ? 'THE SUDS HAVE SETTLED.' : 'A SOLID START. KEEP AT IT.';
    $('resultMessage').textContent = won ? `You finish with ${money(state.cash)} in the till and a public buzz of ${state.buzz}. From dawn commuters to late-night detailers, you made the neighborhood shine. The Suds Network is yours.` : `You finish with ${money(state.cash)} and a public buzz of ${state.buzz}. Your target was $25,000 and 55 buzz. Every great network starts somewhere — use what you learned and give it another go.`;
    $('resultModal').classList.remove('hidden');
  }
  function setTab(tab) {
    document.querySelectorAll('.tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    ['strategy', 'audience', 'ledger'].forEach(name => $(`${name}View`).classList.toggle('hidden', name !== tab));
  }
  function modal(show) { $('modal').classList.toggle('hidden', !show); }
  $('expandBtn').addEventListener('click', expand);
  $('runDayBtn').addEventListener('click', runDay);
  document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));
  $('helpBtn').addEventListener('click', () => modal(true));
  $('closeModal').addEventListener('click', () => modal(false));
  $('gotIt').addEventListener('click', () => modal(false));
  $('continueBtn').addEventListener('click', () => $('resultModal').classList.add('hidden'));
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) modal(false); });
  document.addEventListener('keydown', e => { if (e.key === '?' || e.key === '/') modal(true); if (e.key === 'Escape') modal(false); if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON' && document.activeElement.tagName !== 'SELECT') runDay(); });
  render();
  if (state.day === 1) setTimeout(() => modal(true), 500);
})();

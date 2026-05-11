/**
 * FILAHA Farmer Dashboard — Tab Renderers
 * Each function returns HTML string for a farmer tab.
 */

const FarmerTabs = {
  renderHome(container) {
    const d = FILAHA_APP.profile;
    const fn = d.fname || I18n.t('nav.home');
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const pending = FILAHA_APP.offers.filter(o => o.status === 'pending').length;
    const myListings = FILAHA_APP.listings.filter(l => true).slice(0, 3);
    const et0 = FILAHA_APP.et0 || '—';

    return /*html*/`
      <div class="ds">
        <div class="hero-card">
          <div class="hero-eyebrow"><span class="hero-dot"></span> Filaha · ${d.région || 'Souss-Massa'}</div>
          <div class="hero-greeting">${greeting}, ${fn} 👋</div>
          <div class="hero-sub">${now.toLocaleDateString('fr-MA', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
          <div style="display:flex;gap:14px;margin-top:20px;flex-wrap:wrap;">
            <div style="padding:10px 16px;background:rgba(255,255,255,.1);border-radius:10px;font-size:14px;">
              ${ICONS.sun} <span style="margin-left:6px;">${FILAHA_APP.weather?.current_weather?.temperature ?? '—'}°C · ${FILAHA_APP.weather ? weatherDesc(FILAHA_APP.weather.current_weather.weathercode) : 'Chargement…'}</span>
            </div>
            <div style="padding:10px 16px;background:rgba(255,255,255,.1);border-radius:10px;font-size:14px;">
              ${ICONS.drop} <span style="margin-left:6px;">ET₀ : <strong>${et0} mm/j</strong></span>
            </div>
          </div>
        </div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon-g">${ICONS.tractor}</div>
            <div><div class="kpi-label">${I18n.t('nav.home')}</div><div class="kpi-value num">${d.surface || '—'} <span style="font-size:14px;font-weight:500;color:var(--ink-3)">ha</span></div>
              <div class="kpi-delta up">${ICONS.trendUp} Active</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon-a">${ICONS.cart}</div>
            <div><div class="kpi-label">${I18n.t('offers.received')}</div><div class="kpi-value num" id="kpi-offers">${pending}</div>
              <div class="kpi-delta ${pending > 0 ? 'up' : ''}">${pending > 0 ? ICONS.bell + ' ' + pending + ' en attente' : 'Aucune'}</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon-b">${ICONS.leaf}</div>
            <div><div class="kpi-label">${I18n.t('mai.crop_needs')}</div><div class="kpi-value num">${d.crops.length || 0}</div>
              <div class="kpi-delta up">${ICONS.check} Enregistrées</div></div>
          </div>
        </div>
        ${pending > 0 ? `<div class="alert-strip open" onclick="FILAHA_APP.navigateToFarmerTab('offres')" style="cursor:pointer;">
          <div class="alert-strip-head">${ICONS.bell} <span>${pending} offre${pending>1?'s':''} en attente</span></div>
          <div class="alert-strip-body">Des distributeurs ont fait des offres sur vos récoltes.</div></div>` : ''}
        <div>
          <div class="section-hdr"><div class="section-title">Mes récoltes listées</div></div>
          ${myListings.length ? `<div class="listing-grid">${myListings.map(l => _listingCard(l)).join('')}</div>`
            : `<div class="empty-state"><div class="empty-title">Aucune récolte listée</div>
            <button class="ob-btn" style="width:auto;padding:12px 24px;margin-top:8px" onclick="FILAHA_APP.navigateToFarmerTab('lister')">+ Lister une récolte</button></div>`}
        </div>
        <div>
          <div class="section-hdr"><div class="section-title">Météo 4 jours</div></div>
          <div class="weather-grid" id="home-weather-grid">${_weatherGrid()}</div>
        </div>
      </div>`;
  },

  renderIrrigation(container) {
    const et0 = FILAHA_APP.et0 || 4.2;
    const crops = FILAHA_APP.profile.crops.length ? FILAHA_APP.profile.crops : ['Tomate','Pomme de terre'];
    const KC = { 'Tomate':1.15,'Pomme de terre':1.10,'Oignon':1.00,'Carotte':1.05,'Courgette':0.95,'Poivron':1.05,'Pastèque':1.00,'Melon':1.00,'Laitue':1.00,'Fève':1.15,'Blé':1.15,'Orge':1.10,'Datte':0.90,'Olive':0.65,'Piment':1.00 };
    const surface = parseFloat(FILAHA_APP.profile.surface) || 1;

    const cropRows = crops.slice(0, 6).map(c => {
      const kc = KC[c] || 1.0;
      const etc = (et0 * kc).toFixed(2);
      const total = (parseFloat(etc) * surface * 10).toFixed(0);
      return `<tr><td style="font-weight:600;">${c}</td><td class="num">${kc.toFixed(2)}</td>
        <td class="num" style="color:var(--b600);font-weight:600;">${etc} mm/j</td>
        <td class="num" style="color:var(--g700);font-weight:600;">${total} L/ha</td></tr>`;
    }).join('');

    return /*html*/`
      <div class="ds">
        <div style="background:linear-gradient(135deg,#0D2B45,#1A4E7A);border-radius:18px;padding:28px 32px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:radial-gradient(400px 200px at 100% 0%,rgba(79,163,209,.2),transparent 60%);pointer-events:none;"></div>
          <div style="position:relative;z-index:1;">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.12);font-size:12px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:12px;">${ICONS.drop} MAÏ — Irrigation</div>
            <div style="font-size:30px;font-weight:600;letter-spacing:-.02em;color:#fff;line-height:1.1;">
              ${et0 <= 3 ? "N'arrosez pas aujourd'hui" : et0 <= 5 ? 'Arrosez modérément ce soir' : 'Irrigation urgente requise'}
            </div>
            <div style="font-size:14px;color:rgba(255,255,255,.6);margin-top:6px;">
              ${et0 <= 3 ? 'لا تسقي اليوم — التربة رطبة بما يكفي' : et0 <= 5 ? 'اسقِ بشكل معتدل مساءً' : 'ري عاجل مطلوب'}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.1);font-size:13px;color:rgba(255,255,255,.85);">${ICONS.sun} ${FILAHA_APP.weather?.current_weather?.temperature ?? '—'}°C · ${FILAHA_APP.profile.région || 'Souss-Massa'}</span>
              <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.1);font-size:13px;color:rgba(255,255,255,.85);">${ICONS.drop} ET₀: <strong>${et0} mm/j</strong></span>
              <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.1);font-size:13px;color:rgba(255,255,255,.85);">💰 Économie estimée: ~${Math.round(et0 * 8)} DH</span>
            </div>
          </div>
        </div>
        <div class="et0-card">
          <div>
            <div class="hero-eyebrow" style="margin-bottom:8px;">${ICONS.drop} Évapotranspiration de référence</div>
            <div><span class="et0-num num">${et0}</span><span class="et0-unit">mm/j</span></div>
            <div class="et0-sub">Calculé via Open-Meteo · Méthode FAO-56 Penman-Monteith</div>
          </div>
          <div style="text-align:right;">
            <div class="weather-grid" style="grid-template-columns:1fr 1fr;gap:10px;">
              ${FILAHA_APP.weather ? [
                {icon:ICONS.sun, val: Math.round(FILAHA_APP.weather.current_weather?.temperature ?? 28)+'°C', lbl:'Température'},
                {icon:ICONS.wind, val: Math.round(FILAHA_APP.weather.current_weather?.windspeed ?? 12)+' km/h', lbl:'Vent'},
                {icon:ICONS.cloud, val: (FILAHA_APP.weather.daily?.precipitation_sum?.[0]?.toFixed(1) ?? '0')+'mm', lbl:'Pluie'},
                {icon:ICONS.drop, val: et0+'mm', lbl:'ET₀ FAO-56'},
              ].map(x => `<div class="weather-tile"><div class="weather-icon">${x.icon}</div>
                <div class="weather-val num" style="font-size:16px;">${x.val}</div>
                <div class="weather-lbl">${x.lbl}</div></div>`).join('') : '<div style="color:var(--ink-4);font-size:13px;">Chargement…</div>'}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><div><div class="card-eyebrow">Besoins par culture (ETc)</div>
            <div style="font-size:16px;font-weight:600;margin-top:4px;">ETc = ET₀ × Kc</div></div></div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead><tr style="border-bottom:1.5px solid var(--line);"><th style="text-align:left;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-4);">Culture</th>
            <th style="text-align:left;padding:8px 8px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-4);">Kc</th>
            <th style="text-align:left;padding:8px 8px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-4);">ETc (mm/j)</th>
            <th style="text-align:left;padding:8px 8px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-4);">Volume/ha</th></tr></thead>
            <tbody>${cropRows}</tbody>
          </table>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-eyebrow">Évolution ET₀ — 7 jours</div></div>
          <div class="chart-wrap"><canvas id="chart-et0"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-eyebrow">${I18n.t('mai.tips')}</div></div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;gap:12px;align-items:flex-start;padding:12px;background:var(--b50);border-radius:10px;">
              <div style="color:var(--b700);flex-shrink:0;margin-top:2px;">${ICONS.info}</div>
              <div style="font-size:14px;color:var(--b700);line-height:1.6;"><strong>Arrosage tôt le matin</strong> (5h–8h) réduit l'évaporation de 40%.</div></div>
            <div style="display:flex;gap:12px;align-items:flex-start;padding:12px;background:var(--g50);border-radius:10px;">
              <div style="color:var(--g700);flex-shrink:0;margin-top:2px;">${ICONS.check}</div>
              <div style="font-size:14px;color:var(--g700);line-height:1.6;"><strong>Tensiomètre :</strong> irriguer quand la tension dépasse 30–40 cbar pour les légumes.</div></div>
          </div>
        </div>
      </div>`;
  },

  renderDiagnostic(container) {
    return /*html*/`
      <div class="ds">
        <div class="hero-card">
          <div class="hero-eyebrow">${ICONS.leaf} Diagnostic phytosanitaire par IA</div>
          <div class="hero-greeting" style="font-size:24px;">Analysez vos plantes</div>
          <div class="hero-sub">Téléversez une photo de la plante affectée. L'IA identifie la maladie et propose un traitement.</div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-eyebrow">Photo de la plante</div></div>
          <div class="upload-zone" id="upload-zone" onclick="document.getElementById('plant-file').click()">
            <div style="font-size:40px;margin-bottom:12px;">📷</div>
            <div style="font-size:15px;font-weight:600;color:var(--ink-2);margin-bottom:6px;">Cliquez pour choisir une photo</div>
            <div style="font-size:13px;color:var(--ink-4);">JPG, PNG · max 10 Mo</div>
          </div>
          <input type="file" id="plant-file" accept="image/*" style="display:none" onchange="App.handlePlantUpload(event)"/>
          <div id="plant-preview" style="margin-top:12px;display:none;">
            <img id="plant-img" style="width:100%;border-radius:12px;max-height:280px;object-fit:cover;" alt="Photo"/>
            <button onclick="App.analyzePlant()" style="width:100%;padding:13px;border-radius:12px;background:var(--g700);color:#fff;font-size:15px;font-weight:600;margin-top:12px;">${ICONS.leaf} Analyser avec l'IA →</button>
          </div>
        </div>
        <div id="diag-loading" style="display:${FILAHA_APP.diagnosisLoading ? 'flex' : 'none'};flex-direction:column;align-items:center;gap:16px;padding:40px;">
          <div class="spinner"></div>
          <div style="font-size:14px;color:var(--ink-3);">Analyse en cours…</div>
        </div>
        ${FILAHA_APP.diagnosisResult ? _diagResult(FILAHA_APP.diagnosisResult) : ''}
      </div>`;
  },

  renderAlerts(container) {
    return /*html*/`
      <div class="ds">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div><div class="section-title">${I18n.t('alerts.title')}</div></div>
          <button onclick="Modal.alert({title:'Signalement',message:'Fonctionnalité à venir',onClose:()=>{}})" class="ob-btn" style="width:auto;padding:10px 18px;">${ICONS.plus} Signaler</button>
        </div>
        ${FILAHA_APP.alerts.map(a => {
          const icon = a.type === 'crit' ? ICONS.warning : a.type === 'warn' ? ICONS.warning : ICONS.info;
          return `<div class="alert-card ${a.type}">
            <div style="flex-shrink:0;margin-top:2px;">${icon}</div>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
                <span class="alert-sev sev-${a.type}">${a.sev}</span>
                <span style="font-size:11px;color:var(--ink-4);">${a.crop}</span>
              </div>
              <div class="alert-title">${a.title}</div>
              <div class="alert-desc">${a.desc}</div>
              <div class="alert-meta">${ICONS.pin} ${a.region}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  },

  renderPrix(container) {
    const crop = FILAHA_APP.selectedCrop || 'Tomate';
    const data = FILAHA_APP.prices[crop] || PRICE_DATA[crop] || PRICE_DATA['Tomate'];
    const trendIcon = data.trend === 'up' ? ICONS.trendUp : data.trend === 'down' ? ICONS.trendDown : ICONS.trendFlat;
    const trendClass = data.trend === 'up' ? 'up' : data.trend === 'down' ? 'down' : 'stable';
    const crops = Object.keys(PRICE_DATA);

    return /*html*/`
      <div class="ds">
        <div style="background:linear-gradient(135deg,#3D1F0A,#6B3A1F);border-radius:18px;padding:28px 32px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:radial-gradient(400px 200px at 100% 0%,rgba(196,148,90,.2),transparent 60%);pointer-events:none;"></div>
          <div style="position:relative;z-index:1;">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.12);font-size:12px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:12px;">${trendIcon} SILA — ${I18n.t('nav.prices')}</div>
            <div style="font-size:30px;font-weight:600;letter-spacing:-.02em;color:#fff;line-height:1.1;">
              ${data.trend === 'up' ? 'Attendez encore' : data.trend === 'down' ? 'Vendez maintenant' : 'Prix stables'}
            </div>
          </div>
        </div>
        <div class="crop-tabs">${crops.map(c => `<button class="crop-tab${c===crop?' active':''}" onclick="App.selectCrop('${c}')">${c}</button>`).join('')}</div>
        <div class="card">
          <div class="card-eyebrow" style="margin-bottom:12px;">Prix actuel · ${crop}</div>
          <div class="price-current"><span class="price-num num">${data.current}</span><span class="price-unit">${data.unit}</span>
          <span class="price-trend ${trendClass}">${trendIcon} ${data.trend === 'up' ? '+' : data.trend === 'down' ? '-' : '=' } vs mois dernier</span></div>
          <div class="chart-wrap"><canvas id="chart-prix"></canvas></div>
        </div>
        <div class="insight-card"><div class="insight-eye">💡 Analyse du marché</div><p class="insight-txt">"${data.insight}"</p></div>
        <div class="card"><div class="card-eyebrow" style="margin-bottom:14px;">Comparaison par région</div>
          <table class="region-table"><thead><tr><th>Région</th><th>Prix</th><th>Écart</th></tr></thead>
          <tbody>${data.regions.map(r => `<tr${r.me?' class="my-row"':''}><td style="font-weight:${r.me?'700':'400'}">${r.name}</td>
            <td class="num" style="color:var(--g700);">${r.price} DH/kg</td>
            <td class="num" style="color:${r.diff>0?'var(--pos)':r.diff<0?'var(--neg)':'var(--warn)'};">${r.diff>0?'+':''}${r.diff} DH</td></tr>`).join('')}</tbody></table>
        </div>
      </div>`;
  },

  renderConservation() {
    return /*html*/`
      <div class="ds">
        <div><div class="section-title">Guide de conservation</div>
        <span class="section-ar">دليل التخزين</span>
        <p style="font-size:14px;color:var(--ink-3);margin-top:6px;">Conditions optimales de stockage post-récolte.</p></div>
        ${CONSERV_DATA.map((c,i) => `
          <div class="conserv-card${FILAHA_APP.conservExpanded===i?' expanded':''}" id="conserv-${i}" onclick="App.toggleConserv(${i})">
            <div class="conserv-head">
              <span class="conserv-emoji">${c.emoji}</span>
              <div><div class="conserv-crop">${c.crop}</div><div class="conserv-dur">${ICONS.calendar} ${c.duration}</div></div>
              <div class="conserv-chevron">${ICONS.chevronRight}</div>
            </div>
            <div class="conserv-body"><div class="conserv-content">
              <div class="conserv-row"><div class="conserv-item"><strong>Température</strong>${c.temp}</div>
              <div class="conserv-item"><strong>Humidité</strong>${c.humidity}</div></div>
              <div style="font-size:13px;font-weight:600;color:var(--g700);margin-bottom:8px;">${ICONS.check} Recommandations</div>
              <div class="check-list">${c.tips.map(t=>`<div class="check-item"><span class="check-ic">${ICONS.check}</span>${t}</div>`).join('')}</div>
              <div style="font-size:13px;font-weight:600;color:var(--neg);margin-top:14px;margin-bottom:8px;">${ICONS.x} À éviter</div>
              <div class="x-list">${c.avoid.map(a=>`<div class="x-item"><span class="x-ic">${ICONS.x}</span>${a}</div>`).join('')}</div>
            </div></div>
          </div>`).join('')}
      </div>`;
  },

  renderLister() {
    const crops = ['Tomate','Pomme de terre','Oignon','Carotte','Pastèque','Melon'];
    const emojis = {Tomate:'🍅','Pomme de terre':'🥔',Oignon:'🧅',Carotte:'🥕','Pastèque':'🍉','Melon':'🍈'};
    const lf = FILAHA_APP.listForm;
    const total = lf.qty && lf.price ? (parseFloat(lf.qty) * parseFloat(lf.price)).toLocaleString('fr-MA') + ' DH' : '—';
    const emoji = emojis[lf.crop] || '🌾';

    return /*html*/`
      <div class="ds">
        <div class="lister-grid">
          <div>
            <div class="section-title" style="margin-bottom:16px;">Publier une récolte</div>
            <div class="form-sel-wrap"><label for="l-crop">Culture *</label>
              <select id="l-crop" onchange="App.updateListForm('crop',this.value)">
                ${crops.map(c=>`<option value="${c}"${lf.crop===c?' selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-field"><input type="number" id="l-qty" placeholder=" " value="${lf.qty}" min="1" oninput="App.updateListForm('qty',this.value)"/>
              <label for="l-qty">Quantité disponible (kg) *</label></div>
            <div class="form-suffix-row" style="margin-bottom:16px;">
              <input type="number" id="l-price" placeholder="Prix demandé" value="${lf.price}" min="1" oninput="App.updateListForm('price',this.value)"/>
              <span class="form-suffix-lbl">DH / kg</span>
            </div>
            ${lf.qty && lf.price ? `<div class="live-total">Valeur totale estimée : <strong>${total}</strong></div>` : ''}
            <button class="publish-btn" onclick="App.publishListing('${emoji}')">🌾 Publier la récolte</button>
          </div>
          <div class="preview-card-outer"><div class="preview-card">
            <div class="preview-tag">Aperçu</div>
            <div style="text-align:center;padding:20px;">
              <span style="font-size:60px;">${emoji}</span>
              <div style="font-size:18px;font-weight:700;margin-top:8px;">${lf.crop}</div>
              <div style="font-size:13px;color:var(--ink-4);margin-top:4px;">${lf.qty || 0} kg · ${FILAHA_APP.profile.région || 'Souss-Massa'}</div>
              <div style="font-size:22px;font-weight:700;color:var(--g700);margin-top:12px;">${total}</div>
            </div>
          </div></div>
        </div>
      </div>`;
  },

  renderOffres() {
    const pending = FILAHA_APP.offers.filter(o => o.status === 'pending');
    const confirmed = FILAHA_APP.offers.filter(o => o.status !== 'pending');

    return /*html*/`
      <div class="ds">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div class="section-title">${I18n.t('offers.received')}</div>
          <span class="section-ar">العروض الواردة</span>
        </div>
        ${pending.length ? pending.map(o => `
          <div class="offer-card">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div class="offer-avatar">${o.avatar}</div>
              <div><div style="font-weight:600;">${o.dist}</div>
                <div style="font-size:12px;color:var(--ink-4);">${o.date} · ${o.qty} kg</div></div>
              </div>
              <div style="margin-left:auto;text-align:right;">
                <div class="offer-price-num">${o.priceOffered} DH/kg</div>
                <span class="pill-pending">En attente</span>
              </div>
            </div>
            <p style="font-size:13px;color:var(--ink-3);margin-bottom:12px;">${o.note}</p>
            <div class="offer-actions">
              <button class="btn-accept" onclick="App.handleOffer(${o.id},'accepted')">Accepter</button>
              <button class="btn-nego" onclick="App.handleOffer(${o.id},'countered')">Négocier</button>
              <button class="btn-reject" onclick="App.handleOffer(${o.id},'rejected')">Refuser</button>
            </div>
          </div>`).join('') : '<div class="empty-state"><div class="empty-title">Aucune offre en attente</div></div>'}

        ${confirmed.length ? `
        <div style="margin-top:24px;">
          <div class="section-title">Historique</div>
          ${confirmed.map(o => `
            <div class="offer-card ${o.status==='accepted'?'accepted':'rejected'}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:600;">${o.dist}</div>
                  <div style="font-size:12px;color:var(--ink-4);">${o.date} · ${o.qty} kg · ${o.priceOffered} DH/kg</div>
                </div>
                <span class="pill-${o.status==='accepted'?'confirmed':'rejected'}">${o.status==='accepted'?'Confirmé':'Refusé'}</span>
              </div>
            </div>`).join('')}
        </div>` : ''}
      </div>`;
  },

  renderStats() {
    const d = FILAHA_APP.profile;
    const surface = parseFloat(d.surface) || 0;
    return /*html*/`
      <div class="ds">
        <div class="hero-card">
          <div class="hero-eyebrow"><span class="hero-dot"></span> ${I18n.t('nav.stats')}</div>
          <div class="hero-greeting">Statistiques</div>
        </div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-card-icon" style="background:var(--g50);color:var(--canopy);">${ICONS.tractor}</div>
            <div class="stat-card-val">${surface || 0} <span style="font-size:16px;color:var(--ink-3)">ha</span></div>
            <div class="stat-card-lbl">Surface totale</div></div>
          <div class="stat-card"><div class="stat-card-icon" style="background:var(--g50);color:var(--canopy);">${ICONS.leaf}</div>
            <div class="stat-card-val">${d.crops.length}</div>
            <div class="stat-card-lbl">Cultures suivies</div></div>
          <div class="stat-card"><div class="stat-card-icon" style="background:var(--amber-light);color:var(--amber-ink);">${ICONS.cart}</div>
            <div class="stat-card-val">${FILAHA_APP.listings.length}</div>
            <div class="stat-card-lbl">Listings actifs</div></div>
          <div class="stat-card"><div class="stat-card-icon" style="background:var(--b50);color:var(--b700);">${ICONS.alert}</div>
            <div class="stat-card-val">${FILAHA_APP.offers.length}</div>
            <div class="stat-card-lbl">Offres reçues</div></div>
        </div>
        <div class="impact-card">
          <div class="impact-item"><div class="impact-val">${surface * 12000 || 0}</div><div class="impact-lbl">Litres économisés/an (est.)</div></div>
          <div class="impact-item"><div class="impact-val">${d.crops.length * 15 || 0}%</div><div class="impact-lbl">Rendement estimé ↑</div></div>
          <div class="impact-item"><div class="impact-val">${FILAHA_APP.listings.length * 3 || 0}</div><div class="impact-lbl">Contacts distributeurs</div></div>
        </div>
        <div class="card"><div class="card-eyebrow">Détection IA — Historique</div>
          ${FILAHA_APP.detectionResult ? _diagResult(FILAHA_APP.detectionResult) : '<div class="empty-state"><div class="empty-sub">Aucune analyse effectuée pour le moment</div></div>'}
        </div>
      </div>`;
  },

  renderMessages() {
    return /*html*/`
      <div class="ds">
        <div class="hero-card">
          <div class="hero-eyebrow"><span class="hero-dot"></span> Communauté Filaha</div>
          <div class="hero-greeting">Réseau Agricole</div>
          <div class="hero-sub">Connectez-vous avec d'autres agriculteurs et distributeurs</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          <div class="card" style="cursor:pointer" onclick="FILAHA_APP.navigateToFarmerTab('alertes')">
            <div class="card-head"><div class="card-eyebrow">Alertes communautaires</div></div>
            <p style="font-size:14px;color:var(--ink-3);line-height:1.6;">Rejoignez le réseau d'agriculteurs partageant des alertes sur les ravageurs, maladies et conditions météo dans votre région.</p>
            <div style="margin-top:12px;display:flex;align-items:center;gap:8px;color:var(--g700);font-weight:600;font-size:14px;">${ICONS.people} Rejoindre la communauté →</div>
          </div>
          <div class="card" style="cursor:pointer" onclick="App.selectCrop('Tomate')">
            <div class="card-head"><div class="card-eyebrow">Conseils d'experts</div></div>
            <p style="font-size:14px;color:var(--ink-3);line-height:1.6;">Accédez aux recommandations d'experts en agronomie, adaptées à votre région et vos cultures.</p>
            <div style="margin-top:12px;display:flex;align-items:center;gap:8px;color:var(--b700);font-weight:600;font-size:14px;">${ICONS.leaf} Obtenir des conseils →</div>
          </div>
        </div>
      </div>`;
  }
};

// Helper: render ET₀ chart
function renderEt0Chart() {
  setTimeout(() => {
    const ctx = document.getElementById('chart-et0');
    if (!ctx) return;
    if (FILAHA_APP.chartInstances?.et0) FILAHA_APP.chartInstances.et0.destroy();
    const labels = FILAHA_APP.weather?.daily?.time?.slice(0,7).map(t => {
      const d = new Date(t); return ['D','L','M','M','J','V','S'][d.getDay()];
    }) || ['L','M','M','J','V','S','D'];
    const values = FILAHA_APP.weather?.daily?.et0_fao_evapotranspiration?.slice(0,7).map(v => parseFloat(v.toFixed(2))) || [3.8,4.2,4.5,4.1,3.9];
    FILAHA_APP.chartInstances = FILAHA_APP.chartInstances || {};
    FILAHA_APP.chartInstances.et0 = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'ET₀ (mm/j)', data: values, backgroundColor: 'rgba(33,118,174,0.15)', borderColor: '#2176AE', borderWidth: 2, borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { family: 'Manrope', size: 11 } } }, x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 12 } } } } }
    });
  }, 50);
}

function renderPriceChart(crop) {
  const data = FILAHA_APP.prices[crop] || PRICE_DATA[crop] || PRICE_DATA['Tomate'];
  setTimeout(() => {
    const ctx = document.getElementById('chart-prix');
    if (!ctx) return;
    if (FILAHA_APP.chartInstances?.prix) FILAHA_APP.chartInstances.prix.destroy();
    FILAHA_APP.chartInstances = FILAHA_APP.chartInstances || {};
    FILAHA_APP.chartInstances.prix = new Chart(ctx, {
      type: 'line',
      data: { labels: data.labels, datasets: [{ label: 'DH/kg', data: data.history, borderColor: data.trend==='up'?'#2E7D32':data.trend==='down'?'#B5402F':'#D97706', backgroundColor: data.trend==='up'?'rgba(46,125,50,.08)':data.trend==='down'?'rgba(181,64,47,.08)':'rgba(217,119,6,.08)', borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 4 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{font:{family:'Manrope',size:11}}}, x:{grid:{display:false},ticks:{font:{family:'DM Sans',size:12}}} } }
    });
  }, 50);
}

function weatherDesc(code) {
  if (code === 0) return 'Ensoleillé';
  if (code <= 3) return 'Nuageux';
  if (code <= 49) return 'Brouillard';
  if (code <= 69) return 'Pluvieux';
  if (code <= 79) return 'Neigeux';
  if (code <= 99) return 'Orageux';
  return 'Variable';
}

function _listingCard(l) {
  const emoji = { Tomate:'🍅','Pomme de terre':'🥔','Oignon':'🧅','Carotte':'🥕','Pastèque':'🍉','Melon':'🍈','Laitue':'🥗','Fève':'🫘','Blé':'🌾','Orge':'🌾','Datte':'🌴','Olive':'🫒' };
  return `<div class="listing-card ${l.fresh}">
    <div class="listing-emoji">${emoji[l.crop] || '🌾'}</div>
    <div class="listing-crop">${l.crop}</div>
    <div class="listing-meta">${l.region} · ${l.farmer} · ${l.daysAgo || 0}j</div>
    <div class="listing-price">${l.price} DH/kg</div>
    <div style="font-size:12px;color:var(--ink-4);margin-top:4px;">${l.qty} kg · ${l.variety || ''}</div>
  </div>`;
}

function _weatherGrid() {
  if (!FILAHA_APP.weather) return Array(4).fill(0).map(() => `<div class="weather-tile"><div class="skeleton" style="width:44px;height:44px;border-radius:12px;margin:0 auto 10px;"></div><div class="skeleton" style="height:22px;width:60%;margin:0 auto 4px;border-radius:6px;"></div><div class="skeleton" style="height:14px;width:80%;margin:0 auto;border-radius:6px;"></div></div>`).join('');
  const d = FILAHA_APP.weather.daily;
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  return (d.time || []).slice(0,4).map((t,i) => {
    const date = new Date(t);
    const code = d.weathercode[i];
    const icon = code===0?ICONS.sun:code<=3?ICONS.cloud:code<=69?ICONS.cloud:ICONS.wind;
    return `<div class="weather-tile"><div class="weather-icon">${icon}</div><div class="weather-val num">${Math.round(d.temperature_2m_max[i])}°</div><div class="weather-unit">${Math.round(d.temperature_2m_min[i])}° min · ${d.precipitation_sum[i].toFixed(1)}mm</div><div class="weather-lbl">${i===0?"Aujourd'hui":days[date.getDay()]}</div></div>`;
  }).join('');
}

function _diagResult(r) {
  const pct = r.confidence || 87;
  return `<div class="diagnosis-result"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;">
    <div><div class="card-eyebrow" style="margin-bottom:4px;">Résultat du diagnostic</div><div style="font-size:20px;font-weight:700;color:var(--ink);">${r.disease}</div></div>
    <span style="font-size:12px;font-weight:700;padding:4px 10px;border-radius:var(--r-full);background:#FCE8E6;color:var(--neg);">${r.severity}</span></div>
    <div style="font-size:13px;color:var(--ink-4);margin-bottom:4px;">Confiance : ${pct}%</div>
    <div class="confidence-bar"><div class="confidence-fill" style="width:${pct}%"></div></div>
    <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:12px;">Traitement recommandé</div>
    ${(r.treatment||[]).map((s,i)=>`<div class="treatment-step"><div class="step-num">${i+1}</div><div>${s}</div></div>`).join('')}
    <div class="prevention-box">${ICONS.leaf}<div><strong>Prévention :</strong> ${r.prevention||''}</div></div>
  </div>`;
}

window.FarmerTabs = FarmerTabs;
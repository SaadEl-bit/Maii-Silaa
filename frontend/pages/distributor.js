/**
 * FILAHA Distributor Dashboard — Tab Renderers
 */

const DistTabs = {
  renderDistHome(container) {
    const name = FILAHA_APP.user?.name || 'Distributeur';
    return /*html*/`
      <div class="ds">
        <div class="hero-card dist-hero">
          <div class="hero-eyebrow"><span class="hero-dot"></span> Espace Distributeur</div>
          <div class="hero-greeting">Bienvenue, ${name}</div>
          <div class="hero-sub">Explorez les récoltes disponibles et gérez vos offres</div>
        </div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-card-icon" style="background:var(--g50);color:var(--canopy);">${ICONS.boxes}</div>
            <div class="stat-card-val">${FILAHA_APP.listings.length}</div>
            <div class="stat-card-lbl">Récoltes disponibles</div></div>
          <div class="stat-card"><div class="stat-card-icon" style="background:var(--amber-light);color:var(--amber-ink);">${ICONS.cart}</div>
            <div class="stat-card-val">${FILAHA_APP.offers.filter(o=>o.status==='pending').length}</div>
            <div class="stat-card-lbl">Offres en attente</div></div>
          <div class="stat-card"><div class="stat-card-icon" style="background:var(--b50);color:var(--b700);">${ICONS.check}</div>
            <div class="stat-card-val">${FILAHA_APP.offers.filter(o=>o.status==='accepted').length}</div>
            <div class="stat-card-lbl">Offres confirmées</div></div>
        </div>
        <div class="card"><div class="card-eyebrow">Actions rapides</div>
          <div style="display:flex;gap:12;margin-top:12px;flex-wrap:wrap;">
            <button class="offer-btn" onclick="FILAHA_APP.navigateToDistTab('dlistings')">Parcourir les récoltes</button>
            <button class="offer-btn" style="background:var(--b700)" onclick="FILAHA_APP.navigateToDistTab('doffres')">Gérer mes offres</button>
          </div>
        </div>
      </div>`;
  },

  renderDistMap(container) {
    return /*html*/`
      <div class="ds">
        <div class="hero-card dist-hero" style="padding:20px 24px;">
          <div class="hero-eyebrow"><span class="hero-dot"></span> Carte des récoltes</div>
          <div class="hero-greeting" style="font-size:24px;">Où sont les récoltes ?</div>
          <div class="hero-sub">Localisez les récoltes disponibles par région</div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-eyebrow">Offres par région</div></div>
          <table class="region-table"><thead><tr><th>Région</th><th>Culture</th><th>Quantité</th><th>Prix</th></tr></thead>
          <tbody>${FILAHA_APP.listings.slice(0,10).map(l => `<tr>
            <td style="font-weight:600;">${l.region || 'Souss-Massa'}</td>
            <td><span style="margin-right:6px;">${l.emoji || '🌾'}</span>${l.crop}</td>
            <td class="num">${l.qty} ${l.unit||'kg'}</td>
            <td class="num" style="color:var(--g700);font-weight:600;">${l.price} DH/${l.unit||'kg'}</td>
          </tr>`).join('')}</tbody></table>
        </div>
        <div id="map-container" style="border-radius:var(--r-lg);overflow:hidden;height:300px;background:var(--g50);margin-top:16px;">
          <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink-4);">
            <div style="text-align:center;"><div style="font-size:40px;margin-bottom:8px;">🗺️</div><div style="font-size:14px;">Carte interactive à venir</div></div>
          </div>
        </div>
      </div>`;
  },

  renderDistListings(container) {
    const filters = ['Tomate','Pomme de terre','Oignon','Carotte','Pastèque'];
    return /*html*/`
      <div class="ds">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
          <div class="section-title">Récoltes disponibles</div>
          <div class="search-wrap"><input type="text" id="listing-search" placeholder="Rechercher une culture…"/></div>
        </div>
        <div class="crop-tabs" style="margin-bottom:20px;">
          <button class="crop-tab ${!FILAHA_APP.distFilter||FILAHA_APP.distFilter==='all'?'active':''}" onclick="App.filterListings('all')">Toutes</button>
          ${filters.map(c => `<button class="crop-tab ${FILAHA_APP.distFilter===c?'active':''}" onclick="App.filterListings('${c}')">${c}</button>`).join('')}
        </div>
        <div class="listing-grid">
          ${FILAHA_APP.listings.filter(l => !FILAHA_APP.distFilter || FILAHA_APP.distFilter === 'all' || l.crop === FILAHA_APP.distFilter).map(l => `
            <div class="listing-card">
              <div class="listing-emoji">${l.emoji || '🌾'}</div>
              <div class="listing-crop">${l.crop}</div>
              <div class="listing-meta">${l.region} · ${l.farmer} · ${l.daysAgo||0}j</div>
              <div class="listing-price">${l.price} DH/kg</div>
              <div style="font-size:12px;color:var(--ink-4);margin-top:4px;">${l.qty} kg · ${l.variety||''}</div>
              <button class="offer-btn" onclick="App.openOfferModal(${l.id})" style="margin-top:10px;">Faire une offre</button>
            </div>`).join('')}
        </div>
        ${!FILAHA_APP.listings.length ? '<div class="empty-state"><div class="empty-title">Aucune récolte disponible</div></div>' : ''}
      </div>`;
  },

  renderDistOffers(container) {
    const sent = FILAHA_APP.offers.filter(o => true);
    return /*html*/`
      <div class="ds">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div class="section-title">${I18n.t('offers.received')}</div>
        </div>
        ${sent.length ? sent.map(o => `<div class="offer-card ${o.status==='accepted'?'accepted':o.status==='rejected'?'rejected':''}">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div class="offer-avatar">${o.avatar}</div>
            <div><div style="font-weight:600;">${o.farmer||o.dist}</div>
              <div style="font-size:12px;color:var(--ink-4);">${o.date} · ${o.qty} kg · ${o.priceOffered} DH/kg</div></div>
            <div style="margin-left:auto"><span class="pill-${o.status}">${o.status==='pending'?'En attente':o.status==='accepted'?'Confirmé':'Refusé'}</span></div>
          </div>
          ${o.note ? `<p style="font-size:13px;color:var(--ink-3);margin-bottom:12px;">${o.note}</p>` : ''}
          ${o.status==='pending' ? `<div class="offer-actions">
            <button class="btn-accept" onclick="App.handleOffer(${o.id},'accepted')">Accepter</button>
            <button class="btn-reject" onclick="App.handleOffer(${o.id},'rejected')">Refuser</button>
          </div>` : ''}
        </div>`).join('') : '<div class="empty-state"><div class="empty-title">Aucune offre</div></div>'}
      </div>`;
  },

  renderDistCommandes(container) {
    const confirmed = FILAHA_APP.offers.filter(o => o.status === 'accepted');
    return /*html*/`
      <div class="ds">
        <div class="section-title">Commandes confirmées</div>
        ${confirmed.length ? confirmed.map(o => `<div class="order-card active-order">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div style="font-weight:600;">${o.crop || 'Récolte'} · ${o.qty} kg</div>
            <span class="pill-confirmed">Confirmé</span>
          </div>
          <div class="order-logistics">
            <div><strong>Distributeur</strong>${o.dist || '—'}</div>
            <div><strong>Quantité</strong>${o.qty} kg</div>
            <div><strong>Offre</strong>${o.priceOffered} DH/kg</div>
            <div><strong>Date</strong>${o.date || '—'}</div>
          </div>
          <button class="mark-delivered" onclick="App.markDelivered(${o.id})" style="width:100%">Marquer comme livré</button>
        </div>`).join('') : '<div class="empty-state"><div class="empty-title">Aucune commande</div><div class="empty-sub">Les commandes acceptées apparaîtront ici</div></div>'}
      </div>`;
  }
};

window.DistTabs = DistTabs;
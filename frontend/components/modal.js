/**
 * FILAHA Modal System
 * Replaces the old openModal() / modal-ov system.
 *
 * Usage:
 *   Modal.alert({ title: 'Error', message: 'Something went wrong', onClose: () => {} });
 *   Modal.confirm({ title: 'Confirm', message: 'Delete?', onConfirm: () => {} });
 *   Modal.custom({ html: '<div>...</div>', width: 480 });
 *   Modal.close();
 */

const Modal = {
  _current: null,

  /**
   * Open a modal
   * @param {object} opts - { title, titleAr, content, html, onClose, width, showClose }
   */
  open(opts = {}) {
    const box = document.getElementById('modal-box');
    const ov = document.getElementById('modal-ov');
    if (!box || !ov) return;

    const {
      title = '', titleAr = '', content = '',
      html = '', onClose = null, width = 480, showClose = true,
    } = opts;

    let headerHTML = '';
    if (title || showClose) {
      headerHTML = `
        <div class="modal-head">
          <div>
            <div class="modal-title" id="modal-title">${title}</div>
            ${titleAr ? `<span class="modal-title-ar">${titleAr}</span>` : ''}
          </div>
          ${showClose ? `<button class="modal-close" onclick="Modal.close()" aria-label="Fermer">✕</button>` : ''}
        </div>`;
    }

    box.innerHTML = headerHTML + (html || content);

    ov.classList.add('open');
    this._current = opts;

    // close on backdrop click
    const closeOnBackdrop = (e) => {
      if (e.target === ov) this.close();
    };
    ov.onclick = closeOnBackdrop;

    // focus first input if any
    setTimeout(() => {
      const firstInput = box.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 100);
  },

  close() {
    const ov = document.getElementById('modal-ov');
    const box = document.getElementById('modal-box');
    if (ov) ov.classList.remove('open');
    if (box) box.innerHTML = '';
    if (this._current?.onClose) this._current.onClose();
    this._current = null;
  },

  /** Simple alert */
  alert({ title = 'Info', message, onClose = null }) {
    this.open({
      title,
      html: `<p style="font-size:15px;line-height:1.6;color:var(--ink-2);margin-bottom:20px;">${message}</p>
             <button class="modal-submit" onclick="Modal.close()">OK</button>`,
      onClose,
      showClose: false,
    });
  },

  /** Confirm dialog */
  confirm({ title = 'Confirmation', message, confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, onCancel = null }) {
    this.open({
      title,
      html: `
        <p style="font-size:15px;line-height:1.6;color:var(--ink-2);margin-bottom:24px;">${message}</p>
        <div style="display:flex;gap:10px;">
          <button class="ob-btn" style="flex:1;background:var(--line);color:var(--ink-2);" onclick="Modal.close();${onCancel ? 'typeof ' + onCancel + '==="function"&&' + onCancel + '()' : ''}">${cancelText}</button>
          <button class="modal-submit" style="flex:1;" onclick="Modal.close();${typeof onConfirm === 'function' ? 'window._modalConfirm()' : ''}">${confirmText}</button>
        </div>`,
      showClose: false,
    });
    window._modalConfirm = onConfirm;
  },

  /** Loading modal */
  loading(message = 'Chargement…') {
    this.open({
      title: '',
      html: `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px;">
        <div class="spinner"></div>
        <p style="font-size:14px;color:var(--ink-3);">${message}</p>
      </div>`,
      showClose: false,
    });
  },

  /** Offer modal (distributor sends offer to farmer listing) */
  offerModal({ listing, onSubmit }) {
    this.open({
      title: 'Faire une offre',
      titleAr: 'تقديم عرض',
      html: `
        <div class="modal-ref">
          ${listing.emoji || '🌾'} <strong>${listing.crop}</strong> · ${listing.qty} ${listing.unit} ·
          demandé: <strong>${listing.price} DH/${listing.unit}</strong>
        </div>
        <div class="form-field">
          <input type="number" id="offer-price" placeholder=" " min="1"/>
          <label for="offer-price">Votre prix (DH/${listing.unit})</label>
        </div>
        <div class="form-field">
          <input type="number" id="offer-qty" placeholder=" " value="${listing.qty}" min="1" max="${listing.qty}"/>
          <label for="offer-qty">Quantité (${listing.unit})</label>
        </div>
        <div class="form-field">
          <input type="text" id="offer-note" placeholder=" "/>
          <label for="offer-note">Note (optionnel)</label>
        </div>
        <div class="live-total-modal" id="offer-total">—</div>
        <button class="modal-submit" onclick="Modal.close();window._submitOffer()">Envoyer l'offre</button>`,
      showClose: true,
    });

    window._submitOffer = () => {
      const price = parseFloat(document.getElementById('offer-price')?.value);
      const qty = parseFloat(document.getElementById('offer-qty')?.value);
      const note = document.getElementById('offer-note')?.value || '';
      if (price && qty) onSubmit({ price, qty, note });
    };
  },

  /** Listing preview modal (farmer publishes a listing) */
  listingPreview({ formData, onPublish }) {
    const total = (formData.qty || 0) * (formData.price || 0);
    const emoji = { Tomate: '🍅', 'Pomme de terre': '🥔', Oignon: '🧅', Carotte: '🥕', Courgette: '🥬', Poivron: '🫑', Pastèque: '🍉', Melon: '🍈', 'Laitue': '🥗', 'Fève': '🫘', Blé: '🌾', Orge: '🌾', Datte: '🌴', Olive: '🫒', Piment: '🌶️' };

    this.open({
      title: 'Aperçu de votre publication',
      titleAr: 'معاينة نشرتك',
      html: `
        <div class="preview-tag">Publication</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <span style="font-size:40px;">${emoji[formData.crop] || '🌾'}</span>
          <div>
            <div style="font-size:20px;font-weight:700;">${formData.crop}</div>
            <div style="font-size:13px;color:var(--ink-4);">${formData.qty} kg · ${formData.region || FILAHA_APP.profile.région}</div>
          </div>
        </div>
        <div style="background:var(--g50);border-radius:10px;padding:12px;margin-bottom:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--g700);">${total.toLocaleString('fr-MA')} DH</div>
          <div style="font-size:12px;color:var(--ink-4);">Valeur totale (${formData.qty} × ${formData.price} DH)</div>
        </div>
        <button class="publish-btn" onclick="Modal.close();window._publishListing()">Publier maintenant</button>`,
      showClose: true,
    });

    window._publishListing = onPublish;
  },
};

window.FILAHA_MODAL = Modal;
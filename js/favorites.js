(function () {
  'use strict';

  const STORAGE_KEY = 'favorites';
  let storage = null;
  let favoriteData = {};

  
  function detectStorage() {
    console.log('[Favorites] Detecting storage...');
    
   
    try {
      const test = '__ls_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      console.log('[Favorites] ✓ Using localStorage');
      return localStorage;
    } catch (e) {
      console.warn('[Favorites] localStorage failed:', e.message);
    }

    try {
      const test = '__ss_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      console.log('[Favorites] ✓ Using sessionStorage (fallback)');
      return sessionStorage;
    } catch (e) {
      console.warn('[Favorites] sessionStorage failed:', e.message);
    }

    
    console.warn('[Favorites] ⚠ Using in-memory storage only');
    return null;
  }

  function loadFavorites() {
    console.log('[Favorites] Loading...');
    
    if (storage) {
      try {
        const stored = storage.getItem(STORAGE_KEY);
        if (stored) {
          favoriteData = JSON.parse(stored);
          console.log('[Favorites] ✓ Loaded from storage:', favoriteData);
          return favoriteData;
        }
      } catch (e) {
        console.error('[Favorites] Error parsing stored data:', e);
      }
    }
    
    console.log('[Favorites] No data found, using empty object');
    return favoriteData;
  }

  function saveFavorites(favObj) {
    console.log('[Favorites] Saving:', favObj);
    
    favoriteData = favObj;
    
    if (!storage) {
      console.warn('[Favorites] ⚠ No storage available, keeping in memory only');
      return true;
    }

    try {
      const json = JSON.stringify(favObj);
      console.log('[Favorites] JSON string:', json);
      
      storage.setItem(STORAGE_KEY, json);
      
      
      const verify = storage.getItem(STORAGE_KEY);
      console.log('[Favorites] ✓ Verified saved:', verify);
      
      return true;
    } catch (e) {
      console.error('[Favorites] Error saving to storage:', e);
      console.error('[Favorites] Error type:', e.name, e.code);
      return false;
    }
  }

  function isFavorited(productId) {
    const result = productId in favoriteData;
    console.log('[Favorites] isFavorited(' + productId + '):', result);
    return result;
  }

  
  function toggleFavorite(productId, productName) {
    console.log('[Favorites] ====== TOGGLE START ======');
    console.log('[Favorites] Params:', { productId, productName });

    if (!productId || typeof productId !== 'string') {
      console.error('[Favorites] Invalid productId:', productId);
      return false;
    }

    const id = productId.trim();
    const name = (productName || 'Producto').toString().trim();

    console.log('[Favorites] Clean params:', { id, name });

    if (id in favoriteData) {
      delete favoriteData[id];
      console.log('[Favorites] ✓ Removed:', id);
    } else {
      favoriteData[id] = name;
      console.log('[Favorites] ✓ Added:', { id, name });
    }

    console.log('[Favorites] Current data:', favoriteData);

    const success = saveFavorites(favoriteData);
    console.log('[Favorites] Save success:', success);

    if (success) {
      updateAllFavButtons(id);
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { id, data: favoriteData } }));
    }
    
    console.log('[Favorites] ====== TOGGLE END ======\n');
    return success;
  }

  
  function updateAllFavButtons(productId) {
    const buttons = document.querySelectorAll(`[data-fav-id="${productId}"]`);
    const isFav = isFavorited(productId);
    console.log('[Favorites] Updating ' + buttons.length + ' buttons for ' + productId + ', isFav=' + isFav);
    buttons.forEach(btn => {
      updateButtonUI(btn, isFav);
    });
  }

  function updateButtonUI(btn, isFav) {
    if (!btn) return;
    
    if (isFav) {
      btn.classList.add('favorited');
      btn.innerHTML = '<i class="fas fa-heart"></i>';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('favorited');
      btn.innerHTML = '<i class="far fa-heart"></i>';
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  function createFavButton(productId, productName) {
    const name = (productName || 'Producto').toString().trim();
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fav-btn';
    btn.setAttribute('data-fav-id', productId);
    btn.setAttribute('data-product-name', name);
    btn.setAttribute('aria-label', `Añadir ${name} a favoritos`);
    
    const isFav = isFavorited(productId);
    updateButtonUI(btn, isFav);

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const btnName = this.getAttribute('data-product-name');
      console.log('[Favorites] Button clicked:', { productId, btnName });
      toggleFavorite(productId, btnName);
    });

    return btn;
  }

  function injectFavButtons() {
    console.log('[Favorites] ====== INJECT START ======');
    const allCards = document.querySelectorAll('.product-card');
    console.log('[Favorites] Found ' + allCards.length + ' product cards');

    allCards.forEach((card, idx) => {
      const productId = card.getAttribute('data-product-id');
      
      if (!productId) {
        console.warn('[Favorites] Card ' + idx + ' has no data-product-id');
        return;
      }

      if (card.querySelector('[data-fav-id]')) {
        console.log('[Favorites] Card ' + idx + ' already has button, skipping');
        return;
      }

      let productName = '';
      const nameEl = card.querySelector('.product-name');
      if (nameEl) {
        productName = nameEl.textContent.trim();
      }

      if (!productName) {
        const heading = card.querySelector('h2, h3, h4');
        if (heading) productName = heading.textContent.trim();
      }

      if (!productName) productName = productId;

      console.log('[Favorites] Card ' + idx + ': creating button for ' + productId);

      const btn = createFavButton(productId, productName);

      const img = card.querySelector('img');
      if (img) {
        img.parentNode.insertBefore(btn, img.nextSibling);
      } else {
        card.insertBefore(btn, card.firstChild);
      }
    });
    
    console.log('[Favorites] ====== INJECT END ======\n');
  }

  
  function init() {
    console.log('[Favorites] ====== INIT START ======');
    
    storage = detectStorage();
    
    
    loadFavorites();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectFavButtons);
    } else {
      injectFavButtons();
    }
    
    console.log('[Favorites] ====== INIT END ======\n');
  }

  
  window._favorites = {
    toggle: toggleFavorite,
    isFav: isFavorited,
    load: loadFavorites,
    save: saveFavorites,
    reinit: injectFavButtons,
    data: function() { return favoriteData; },
    clear: function() { 
      favoriteData = {}; 
      saveFavorites({}); 
      injectFavButtons();
    }
  };

  
  init();

})();

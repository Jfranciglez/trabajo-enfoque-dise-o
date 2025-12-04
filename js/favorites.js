(function () {

  const STORAGE_KEY = 'favorites';

  function loadFavorites() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  function saveFavorites(favs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  }

  function isFavorited(id) {
    const favs = loadFavorites();
    return !!favs[id];
  }

  function toggleFavorite(id, name) {
    const favs = loadFavorites();
    if (favs[id]) {
      delete favs[id];
    } else {
      favs[id] = name;
    }
    saveFavorites(favs);
    updateFavButtonUI(id);
  }

  function updateFavButtonUI(id) {
    const btn = document.querySelector(`[data-fav-id="${id}"]`);
    if (!btn) return;
    if (isFavorited(id)) {
      btn.classList.add('favorited');
      btn.textContent = '❤️';
    } else {
      btn.classList.remove('favorited');
      btn.textContent = '🤍';
    }
  }

  function injectFavButtons() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      // skip if already has a fav button
      if (card.querySelector('[data-fav-id]')) return;

      const id = card.getAttribute('data-product-id');
      if (!id) return;

      const name = card.querySelector('.product-name')?.textContent || 'Unknown';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fav-btn';
      btn.setAttribute('data-fav-id', id);
      btn.setAttribute('data-product-name', name);
      btn.textContent = isFavorited(id) ? '❤️' : '🤍';
      if (isFavorited(id)) btn.classList.add('favorited');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(id, name);
      });

      // Insert the fav button in the product meta or at the end of the card
      const meta = card.querySelector('.product-meta');
      if (meta) {
        meta.appendChild(btn);
      } else {
        card.appendChild(btn);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      injectFavButtons();
    } catch (e) {
      console.error('Error initializing favorites:', e);
    }
  });

  window._favorites = {
    toggleFavorite,
    isFavorited,
    loadFavorites
  };

})();

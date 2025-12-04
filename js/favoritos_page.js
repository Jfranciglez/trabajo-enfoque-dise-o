(function () {
  const LS_KEY = 'favorites';

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function removeFavorite(id) {
    const favs = loadFavorites();
    delete favs[id];
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(favs));
    } catch (e) {
      console.error('Error al guardar favoritos:', e);
    }
    return favs;
  }

  function renderFavorites() {
    const favorites = loadFavorites();
    const container = document.getElementById('favoritos-list');
    const sinFavoritos = document.getElementById('sin-favoritos');

    if (!container) return;

    container.innerHTML = '';

    const entries = Object.entries(favorites);
    if (entries.length === 0) {
      if (sinFavoritos) sinFavoritos.style.display = 'block';
      return;
    }

    if (sinFavoritos) sinFavoritos.style.display = 'none';

    entries.forEach(([id, name]) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.productId = id;

      card.innerHTML = `
        <img src="../img/placeholder.png" alt="${name}" class="product-img">
        <h2 class="product-name">${name}</h2>
        <div class="product-meta">
          <button class="fav-btn favorited" type="button" aria-label="Eliminar de favoritos" data-product-id="${id}">❤️</button>
        </div>
      `;

      const favBtn = card.querySelector('.fav-btn');
      favBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeFavorite(id);
        renderFavorites();
      });

      container.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      renderFavorites();
    } catch (e) {
      console.error('Error inicializando página de favoritos:', e);
    }
  });

  // Exponer función para refrescar desde otros scripts
  window._favoritos_page = {
    renderFavorites,
    loadFavorites
  };

})();

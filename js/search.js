(function () {

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function initSearch() {
    const input = document.getElementById('search-input') || document.querySelector('#barrabuscar input');
    const btn = document.getElementById('search-btn') || document.querySelector('#barrabuscar button');
    if (!input) return;

    // on input: try to find locally and scroll/highlight first match after a short debounce
    input.addEventListener('input', debounce(function () {
      const q = input.value.trim();
      if (!q) return;
      searchLocal(q);
    }, 450));

    // Enter key or button: perform full search that will navigate to other pages if needed
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchAndNavigate(input.value.trim());
      }
    });

    if (btn) btn.addEventListener('click', function () {
      searchAndNavigate(input.value.trim());
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.product-card.search-highlight').forEach(el => el.classList.remove('search-highlight'));
  }

  function searchLocal(query) {
    if (!query) return false;
    const q = query.toLowerCase();
    const cards = Array.from(document.querySelectorAll('.product-card'));
    clearHighlights();
    for (const card of cards) {
      const name = (card.querySelector('.product-name') && card.querySelector('.product-name').textContent.toLowerCase()) || '';
      const desc = (card.querySelector('.product-desc') && card.querySelector('.product-desc').textContent.toLowerCase()) || '';
      if (name.includes(q) || desc.includes(q)) {
        card.classList.add('search-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
    }
    return false;
  }

  async function searchAndNavigate(query) {
    const q = (query || '').trim();
    if (!q) return;

    // 1) Try local first
    if (searchLocal(q)) return;

    // 2) Try to find the product in other category pages by fetching the category HTML
    const menuLinks = Array.from(document.querySelectorAll('#menu a')).map(a => a.getAttribute('href'))
      .filter(Boolean);

    for (const href of menuLinks) {
      try {
        const resp = await fetch(href);
        if (!resp.ok) continue;
        const text = await resp.text();
        if (text.toLowerCase().includes(q.toLowerCase())) {
          // navigate to that page with a hash param so it will scroll on load
          const url = href.split('#')[0] + '#search=' + encodeURIComponent(q);
          window.location.href = url;
          return;
        }
      } catch (e) {
        // fetch may fail on some setups; ignore and continue
        console.warn('fetch failed for', href, e);
      }
    }

    // 3) Not found anywhere
    showNoResult(q);
  }

  function showNoResult(q) {
    // minimal feedback: temporary toast near top
    const existing = document.getElementById('search-noresult');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'search-noresult';
    div.textContent = `No se encontró: "${q}"`;
    Object.assign(div.style, {
      position: 'fixed',
      top: '16px',
      right: '16px',
      background: '#333',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '6px',
      zIndex: 9999,
      opacity: '0.95'
    });
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
  }

  // On page load, if a hash param like #search=term exists, run local search to scroll
  function checkHashOnLoad() {
    const h = window.location.hash || '';
    if (h.startsWith('#search=')) {
      const q = decodeURIComponent(h.replace('#search=', ''));
      if (q) {
        // wait a tick for DOM
        setTimeout(() => searchLocal(q), 300);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      initSearch();
      checkHashOnLoad();
    } catch (e) {
      console.error('Error inicializando búsqueda:', e);
    }
  });

  // Exponer funciones para depuración
  window._search = {
    searchLocal,
    searchAndNavigate
  };

})();

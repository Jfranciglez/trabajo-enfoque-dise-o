// Script de carrito usando localStorage
function getCart(){
    try{ return JSON.parse(localStorage.getItem('cart')||'[]'); }catch(e){ return []; }
}
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }
function updateCartCount(){
    const cart = getCart();
    const total = cart.reduce((s,i)=>s + (i.qty||0),0);
    const el = document.getElementById('cart-count');
    if(el) el.textContent = total;
}
function addToCart(item){
    const cart = getCart();
    const existing = cart.find(i=>i.id === item.id && i.name===item.name);
    if(existing){ existing.qty = (existing.qty||1) + (item.qty||1); }
    else { cart.push(Object.assign({qty:1}, item)); }
    saveCart(cart);
    updateCartCount();
}
function clearCart(){ saveCart([]); updateCartCount(); renderCartPage(); }

function renderCartPage(){
    const container = document.getElementById('cart-items');
    if(!container) return;
    const cart = getCart();
    container.innerHTML = '';
    if(cart.length===0){ container.innerHTML = '<p>El carrito está vacío.</p>'; return; }
    const list = document.createElement('div');
    list.className = 'cart-list';
    let total = 0;
    cart.forEach((p, idx)=>{
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
            <img src="${p.image||'../img/placeholder.png'}" alt="${p.name}" style="width:64px;height:auto;margin-right:8px;">
            <strong>${p.name}</strong>
            <span style="margin-left:8px">${p.qty} × €${Number(p.price).toFixed(2)}</span>
            <button data-idx="${idx}" class="cart-remove" style="margin-left:12px">Eliminar</button>
        `;
        list.appendChild(row);
        total += (Number(p.price)||0) * (p.qty||1);
    });
    const footer = document.createElement('div');
    footer.className = 'cart-footer';
    footer.innerHTML = `<p>Total: €${total.toFixed(2)}</p><button id="clear-cart">Vaciar carrito</button>`;
    container.appendChild(list);
    container.appendChild(footer);

    // attach remove handlers
    container.querySelectorAll('.cart-remove').forEach(btn=>{
        btn.addEventListener('click', e=>{
            const idx = Number(e.currentTarget.dataset.idx);
            const c = getCart(); c.splice(idx,1); saveCart(c); renderCartPage(); updateCartCount();
        });
    });
    const clearBtn = document.getElementById('clear-cart');
    if(clearBtn) clearBtn.addEventListener('click', ()=>{ clearCart(); });
}

document.addEventListener('DOMContentLoaded', ()=>{
    // wire up add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            const card = btn.closest('.product-card');
            if(!card) return;
            const name = card.querySelector('.product-name')?.textContent?.trim() || 'Producto';
            const priceText = card.querySelector('.price')?.textContent || '0';
            const price = Number(priceText.replace(/[^0-9.,]/g,'').replace(',','.')) || 0;
            const img = card.querySelector('.product-img')?.getAttribute('src') || '';
            const id = card.dataset.productId || name;
            addToCart({id, name, price, image: img, qty: 1});
            // feedback mínimo
            btn.textContent = 'Añadido';
            setTimeout(()=> btn.textContent = 'Añadir al carrito', 900);
        });
    });

    updateCartCount();
    renderCartPage();
   
});

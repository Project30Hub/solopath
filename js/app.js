// ---------- PayFast config ----------
// PayFast's public SANDBOX test details. Replace with your live merchant details
// and set sandbox:false when you go live. Generate signatures on a server for live use.
const PAYFAST = { sandbox: true, merchant_id: '10000100', merchant_key: '46f0cd694581a' };

const zar = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
const fmt = n => zar.format(n).replace(/\u00a0/g, ' ');
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);

let cart = [];
try { cart = JSON.parse(localStorage.getItem('solopath-cart') || '[]'); } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem('solopath-cart', JSON.stringify(cart)); } catch (e) {} };

const selectedSize = {};
const renderers = [];
const rerender = () => renderers.forEach(fn => fn());

// ---------- Product cards ----------
function cardHTML(p) {
  const size = selectedSize[p.id] || p.sizes[0];
  const url = `product.html?id=${p.id}`;
  return `
  <article class="card">
    <a class="card-img" href="${url}" aria-label="View ${p.name}">
      ${p.tag ? `<span class="tag ${p.tag}">${p.tag}</span>` : ''}
      <img src="${p.img}" alt="${p.name}" loading="lazy" width="600" height="600">
    </a>
    <div class="card-body">
      <div class="card-cat">${p.category}</div>
      <h3 class="card-name"><a href="${url}">${p.name}</a></h3>
      <div class="price">${fmt(p.price)}</div>
      <div class="sizes" role="group" aria-label="Size for ${p.name}">
        ${p.sizes.map(s => `<button class="size" data-id="${p.id}" data-size="${s}" aria-pressed="${s === size}">${s === 'ONE' ? 'One size' : s}</button>`).join('')}
      </div>
      <button class="add" data-add="${p.id}">Add to bag</button>
    </div>
  </article>`;
}

// ---------- Shop / featured grid ----------
let activeCat = params.get('cat') || 'All';
const grid = $('#grid');
if (grid) {
  const limit = +grid.dataset.limit || 0;
  const filters = $('#filters');
  const draw = () => {
    if (filters) {
      const cats = ['All', ...new Set(PRODUCTS.map(p => p.category))];
      filters.innerHTML = cats.map(c => `<button class="chip" role="tab" aria-selected="${c === activeCat}" data-cat="${c}">${c}</button>`).join('');
    }
    let list = PRODUCTS.filter(p => activeCat === 'All' || p.category === activeCat);
    if (limit) list = list.slice(0, limit);
    grid.innerHTML = list.map(cardHTML).join('');
  };
  if (filters) filters.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (b) { activeCat = b.dataset.cat; draw(); }
  });
  renderers.push(draw); draw();
}

// ---------- Product page ----------
const view = $('#productView');
if (view) {
  const p = PRODUCTS.find(x => x.id === params.get('id')) || PRODUCTS[0];
  document.title = `${p.name} — SOLO PATH`;
  const drawProduct = () => {
    const size = selectedSize[p.id] || p.sizes[0];
    view.innerHTML = `
      <div class="pv-img"><img src="${p.img}" alt="${p.name}" width="800" height="800"></div>
      <div class="pv-info">
        ${p.tag ? `<span class="tag ${p.tag} static">${p.tag}</span>` : ''}
        <p class="card-cat">${p.category}</p>
        <h1>${p.name}</h1>
        <p class="pv-price">${fmt(p.price)}</p>
        <p class="pv-desc">Part of Drop 01. Bright, comfortable and made to be worn loud, with the gold stepping stones on show.</p>
        <p class="pv-label">Size</p>
        <div class="sizes" role="group" aria-label="Size">
          ${p.sizes.map(s => `<button class="size big" data-id="${p.id}" data-size="${s}" aria-pressed="${s === size}">${s === 'ONE' ? 'One size' : s}</button>`).join('')}
        </div>
        <button class="btn btn-coral add-big" data-add="${p.id}">Add to bag</button>
        <ul class="pv-points"><li>Prices in ZAR</li><li>Secure checkout with PayFast</li><li>Delivery confirmed after checkout</li></ul>
      </div>`;
  };
  renderers.push(drawProduct); drawProduct();
  const rel = $('#related');
  if (rel) {
    const list = PRODUCTS.filter(x => x.id !== p.id).slice(0, 4);
    const drawRel = () => { rel.innerHTML = list.map(cardHTML).join(''); };
    renderers.push(drawRel); drawRel();
  }
}

// ---------- Lookbook ----------
const look = $('#lookGrid');
if (look) {
  look.innerHTML = PRODUCTS.map((p, i) => `
    <a class="look look-${i % 5}" href="product.html?id=${p.id}">
      <img src="${p.img}" alt="${p.name}" loading="lazy" width="600" height="600">
      <span class="look-cap"><b>Look ${String(i + 1).padStart(2, '0')}</b> ${p.name}</span>
    </a>`).join('');
}

// ---------- Delegated clicks (sizes + add to bag) ----------
document.addEventListener('click', e => {
  const sz = e.target.closest('.size');
  if (sz) { selectedSize[sz.dataset.id] = sz.dataset.size; rerender(); return; }
  const add = e.target.closest('[data-add]');
  if (add) addToCart(add.dataset.add);
});

// ---------- Cart ----------
function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  const size = selectedSize[id] || p.sizes[0];
  const found = cart.find(i => i.id === id && i.size === size);
  if (found) found.qty++; else cart.push({ id, size, qty: 1 });
  save(); renderCart(); toast(`${p.name} added`);
}

function renderCart() {
  const items = cart.map(i => ({ ...i, p: PRODUCTS.find(x => x.id === i.id) })).filter(i => i.p);
  const count = items.reduce((a, i) => a + i.qty, 0);
  const total = items.reduce((a, i) => a + i.qty * i.p.price, 0);
  $('#bagCount').textContent = count;
  $('#cartTotal').textContent = fmt(total);
  $('#checkout').disabled = !count;
  $('#cartItems').innerHTML = items.length ? items.map((i, idx) => `
    <div class="line-item">
      <img src="${i.p.img}" alt="">
      <div>
        <div class="li-name">${i.p.name}</div>
        <div class="li-meta">${i.size === 'ONE' ? 'One size' : 'Size ' + i.size}</div>
        <div class="qty">
          <button data-q="-1" data-i="${idx}" aria-label="Fewer">−</button>
          <span>${i.qty}</span>
          <button data-q="1" data-i="${idx}" aria-label="More">+</button>
        </div>
      </div>
      <div class="li-right"><strong>${fmt(i.qty * i.p.price)}</strong><button class="remove" data-r="${idx}">Remove</button></div>
    </div>`).join('') : '<p class="empty">Your bag is empty.<br>Go lay the first stone.</p>';
}

$('#cartItems').addEventListener('click', e => {
  const q = e.target.closest('[data-q]');
  if (q) {
    const it = cart[+q.dataset.i]; it.qty += +q.dataset.q;
    if (it.qty < 1) cart.splice(+q.dataset.i, 1);
    save(); renderCart(); return;
  }
  const r = e.target.closest('[data-r]');
  if (r) { cart.splice(+r.dataset.r, 1); save(); renderCart(); }
});

function openBag(open) {
  $('#drawer').classList.toggle('open', open);
  $('#overlay').classList.toggle('open', open);
  $('#drawer').setAttribute('aria-hidden', String(!open));
}
$('#bagBtn').onclick = () => openBag(true);
$('#closeBag').onclick = () => openBag(false);
$('#overlay').onclick = () => openBag(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') openBag(false); });

// ---------- PayFast checkout ----------
$('#checkout').onclick = () => {
  const items = cart.map(i => ({ ...i, p: PRODUCTS.find(x => x.id === i.id) })).filter(i => i.p);
  if (!items.length) return;
  const total = items.reduce((a, i) => a + i.qty * i.p.price, 0);
  const base = location.origin + '/index.html';
  const fields = {
    merchant_id: PAYFAST.merchant_id,
    merchant_key: PAYFAST.merchant_key,
    return_url: base + '?paid=1',
    cancel_url: location.href.split('?')[0] + '?cancelled=1',
    amount: total.toFixed(2),
    item_name: 'Solo Path order',
    item_description: items.map(i => `${i.qty}x ${i.p.name} (${i.size})`).join(', ').slice(0, 250)
  };
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = PAYFAST.sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = k; input.value = v; form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};

// ---------- Misc ----------
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

const join = $('#joinForm');
if (join) join.addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('You are on the path. Welcome.'); });
const contact = $('#contactForm');
if (contact) contact.addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Message sent. Thank you!'); });

if (params.get('paid')) { cart = []; save(); setTimeout(() => toast('Payment received. Thank you!'), 400); history.replaceState({}, '', location.pathname); }
if (params.get('cancelled')) { setTimeout(() => toast('Checkout cancelled. Your bag is saved.'), 400); history.replaceState({}, '', location.pathname); }

renderCart();

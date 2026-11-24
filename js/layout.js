(function () {
  const page = document.body.dataset.page || '';
  const link = (href, label, key) =>
    `<a href="${href}" ${page === key ? 'aria-current="page"' : ''}>${label}</a>`;

  const header = document.getElementById('site-header');
  if (header) header.outerHTML = `
  <header class="site-header">
    <a class="brand" href="index.html" aria-label="Solo Path home">
      <img src="images/logo.png" alt="Solo Path" width="120" height="120">
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      ${link('index.html', 'Home', 'home')}
      ${link('shop.html', 'Shop', 'shop')}
      ${link('lookbook.html', 'Lookbook', 'lookbook')}
      ${link('about.html', 'About', 'about')}
      ${link('contact.html', 'Contact', 'contact')}
    </nav>
    <div class="header-right">
      <button class="bag-btn" id="bagBtn" aria-label="Open bag">Bag <span class="bag-count" id="bagCount">0</span></button>
      <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </header>`;

  const footer = document.getElementById('site-footer');
  if (footer) footer.outerHTML = `
  <footer class="footer">
    <img src="images/logo.png" alt="Solo Path" width="90" height="90" loading="lazy">
    <nav class="footer-nav" aria-label="Footer">
      <a href="shop.html">Shop</a><a href="lookbook.html">Lookbook</a><a href="about.html">About</a><a href="contact.html">Contact</a>
    </nav>
    <p>© 2026 SOLO PATH STREETWEAR · South Africa · Prices in ZAR</p>
  </footer>
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="drawer" aria-label="Shopping bag" aria-hidden="true">
    <div class="drawer-head"><h2>Your bag</h2><button class="icon-btn" id="closeBag" aria-label="Close bag">✕</button></div>
    <div class="drawer-body" id="cartItems"></div>
    <div class="drawer-foot">
      <div class="subtotal"><span>Subtotal</span><strong id="cartTotal">R 0.00</strong></div>
      <button class="btn btn-coral wide" id="checkout">Checkout with PayFast</button>
      <p class="fine">Secure payment on PayFast. Delivery confirmed after checkout.</p>
    </div>
  </aside>
  <div class="toast" id="toast" role="status"></div>`;

  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) nav.classList.remove('open'); });
  }
})();

// Scentora Global Engine - Header, Footer, Cart, Modals, Wishlist & Search
(function() {
  'use strict';

  // Ensure favicon is applied with brand logo on all pages
  try {
    let faviconLink = document.querySelector("link[rel~='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      document.head.appendChild(faviconLink);
    }
    const logoSource = (typeof window.SCENTORA_LOGO_URI !== 'undefined' && window.SCENTORA_LOGO_URI) 
      ? window.SCENTORA_LOGO_URI 
      : 'images/scentora-logo.png';
    faviconLink.href = logoSource;
  } catch(e) {}

  // State Management
  const CART_KEY = 'scentora_cart_items';
  const WISHLIST_KEY = 'scentora_wishlist_items';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveWishlist(wishlist) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    updateWishlistUI();
  }

  window.ScentoraCart = {
    get: getCart,
    addItem: function(product, size = '100ml', quantity = 1) {
      const cart = getCart();
      const existing = cart.find(item => item.id === product.id && item.size === size);
      
      // Calculate adjusted price for size
      let unitPrice = product.price;
      if (size === '50ml') unitPrice = Math.round(product.price * 0.65);
      if (size === '100ml') unitPrice = product.price;
      if (size === '200ml') unitPrice = Math.round(product.price * 1.6);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          family: product.family,
          price: unitPrice,
          originalPrice: product.price,
          size: size,
          quantity: quantity,
          image: product.image
        });
      }
      saveCart(cart);
      showToast(`Added ${product.name} (${size}) to your shopping bag.`);
      // Do not automatically pop open drawer on addition; user opens via cart icon or can view notification
      // openCartDrawer();
    },
    removeItem: function(id, size) {
      let cart = getCart();
      cart = cart.filter(item => !(item.id === id && item.size === size));
      saveCart(cart);
    },
    updateQuantity: function(id, size, delta) {
      const cart = getCart();
      const item = cart.find(i => i.id === id && i.size === size);
      if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
          this.removeItem(id, size);
          return;
        }
      }
      saveCart(cart);
    },
    clear: function() {
      localStorage.removeItem(CART_KEY);
      updateCartUI();
    },
    applyCoupon: function(code) {
      code = code.trim().toUpperCase();
      if (code === 'SCENTORA15' || code === 'LUXURY10') {
        const discountRate = code === 'SCENTORA15' ? 0.15 : 0.10;
        sessionStorage.setItem('scentora_coupon', JSON.stringify({ code, rate: discountRate }));
        updateCartUI();
        return { success: true, message: `Coupon ${code} applied successfully!` };
      }
      return { success: false, message: 'Invalid promotional code.' };
    },
    removeCoupon: function() {
      sessionStorage.removeItem('scentora_coupon');
      updateCartUI();
    }
  };

  window.ScentoraWishlist = {
    get: getWishlist,
    toggle: function(productId) {
      const wishlist = getWishlist();
      const idx = wishlist.indexOf(productId);
      if (idx > -1) {
        wishlist.splice(idx, 1);
        saveWishlist(wishlist);
        showToast('Removed from your wishlist.');
      } else {
        wishlist.push(productId);
        saveWishlist(wishlist);
        showToast('Saved to your wishlist.');
      }
      return wishlist.includes(productId);
    },
    has: function(productId) {
      return getWishlist().includes(productId);
    }
  };

  // Toast Notifications
  window.showToast = function(message) {
    let container = document.getElementById('scentora-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'scentora-toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto bg-[#30231F] text-[#FFFDF9] border border-[#B89A65]/40 px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-sm font-light tracking-wide transform translate-y-4 opacity-0 transition-all duration-300';
    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-[#B89A65] animate-pulse"></span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });
    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Render Consistent Header
  function renderHeader() {
    const headerContainer = document.getElementById('scentora-header');
    if (!headerContainer) return;

    const currentPath = window.location.pathname.toLowerCase();
    const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
    const isAbout = currentPath.includes('about.html');
    const isShop = currentPath.includes('shop.html');
    const isDiscovery = currentPath.includes('discovery.html');
    const isContact = currentPath.includes('contact.html');

    headerContainer.innerHTML = `
      <header class="w-full bg-[#30231F]/95 backdrop-blur-md border-b border-[#B89A65]/20 text-[#FFFDF9] shadow-md">
        <!-- Top Announcement Bar -->
        <div class="bg-[#241A17] text-[#C9BBAA] text-xs py-1.5 px-4 text-center tracking-widest uppercase border-b border-[#B89A65]/10 flex items-center justify-center gap-4">
          <span>Complimentary Signature Gift Packaging & Samples on all orders over $150</span>
          <span class="hidden md:inline text-[#B89A65]">•</span>
          <span class="hidden md:inline text-[#B89A65]">Use Code <strong>SCENTORA15</strong> for 15% Off</span>
        </div>

        <!-- Main Navigation Bar -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <!-- Brand Logo & Emblem Icon (Aligned Left on Mobile/Tablet) -->
          <div class="flex items-center">
            <a href="index.html" class="flex items-center gap-2.5 sm:gap-3.5 group text-decoration-none">
              <!-- Luxury Flacon Monogram Emblem (Before Brand Name) -->
              <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#B89A65]/50 bg-gradient-to-br from-[#3d2d28] via-[#241A17] to-[#1c1310] flex items-center justify-center shadow-lg group-hover:border-[#B89A65] group-hover:shadow-[0_0_15px_rgba(184,154,101,0.35)] transition-all duration-300 flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-[#B89A65] transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <!-- Perfume Flacon & Crown Emblem -->
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M10 2h4M9 5h6M8 8h8l1 13H7L8 8z"></path>
                  <circle cx="12" cy="14" r="2.5" stroke-width="1.3"></circle>
                </svg>
              </div>
              <!-- Typography Mark -->
              <div class="flex flex-col">
                <span class="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.22em] text-[#FFFDF9] uppercase group-hover:text-[#B89A65] transition-colors font-medium leading-none">SCENTORA</span>
                <span class="text-[8px] sm:text-[9px] tracking-[0.35em] text-[#B89A65] uppercase font-light mt-1">Haute Parfumerie</span>
              </div>
            </a>
          </div>

          <!-- Desktop Navigation Links (Exactly 5 Pages) -->
          <nav class="hidden lg:flex items-center space-x-9 text-sm tracking-widest uppercase font-light">
            <a href="index.html" class="relative py-2 hover:text-[#B89A65] transition-colors ${isHome ? 'text-[#B89A65] font-medium active-nav-link' : 'text-[#FFFDF9]/90'}">
              Home
              ${isHome ? '<span class="absolute bottom-0 left-0 w-full h-[2px] bg-[#B89A65]"></span>' : ''}
            </a>
            <a href="about.html" class="relative py-2 hover:text-[#B89A65] transition-colors ${isAbout ? 'text-[#B89A65] font-medium active-nav-link' : 'text-[#FFFDF9]/90'}">
              About
              ${isAbout ? '<span class="absolute bottom-0 left-0 w-full h-[2px] bg-[#B89A65]"></span>' : ''}
            </a>
            <a href="shop.html" class="relative py-2 hover:text-[#B89A65] transition-colors ${isShop ? 'text-[#B89A65] font-medium active-nav-link' : 'text-[#FFFDF9]/90'}">
              Shop
              ${isShop ? '<span class="absolute bottom-0 left-0 w-full h-[2px] bg-[#B89A65]"></span>' : ''}
            </a>
            <a href="discovery.html" class="relative py-2 hover:text-[#B89A65] transition-colors ${isDiscovery ? 'text-[#B89A65] font-medium active-nav-link' : 'text-[#FFFDF9]/90'}">
              Discovery Guide
              ${isDiscovery ? '<span class="absolute bottom-0 left-0 w-full h-[2px] bg-[#B89A65]"></span>' : ''}
            </a>
            <a href="contact.html" class="relative py-2 hover:text-[#B89A65] transition-colors ${isContact ? 'text-[#B89A65] font-medium active-nav-link' : 'text-[#FFFDF9]/90'}">
              Contact
              ${isContact ? '<span class="absolute bottom-0 left-0 w-full h-[2px] bg-[#B89A65]"></span>' : ''}
            </a>
          </nav>

          <!-- Action Icons & Right-Aligned Hamburger Menu -->
          <div class="flex items-center space-x-1 sm:space-x-3">
            <!-- Wishlist Icon Button with Badge -->
            <button id="header-wishlist-btn" class="p-1.5 sm:p-2 text-[#FFFDF9] hover:text-[#B89A65] transition-colors relative" title="View Wishlist" aria-label="Wishlist">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span id="wishlist-badge" class="hidden absolute top-1 right-1 w-4 h-4 bg-[#B89A65] text-[#30231F] text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
            </button>

            <!-- Shopping Cart Icon Button with Live Count -->
            <button id="header-cart-btn" class="p-1.5 sm:p-2 text-[#FFFDF9] hover:text-[#B89A65] transition-colors relative flex items-center" title="Shopping Cart" aria-label="Cart">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <span id="cart-badge" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#B89A65] text-[#30231F] text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
            </button>

            <!-- Account Icon Button -->
            <button id="header-account-btn" class="p-1.5 sm:p-2 text-[#FFFDF9] hover:text-[#B89A65] transition-colors" title="Account & VIP Club" aria-label="Account">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>

            <!-- Right-Aligned Mobile/Tablet Hamburger Trigger Button -->
            <button id="mobile-menu-btn" class="lg:hidden p-1.5 sm:p-2 ml-1 text-[#FFFDF9] hover:text-[#B89A65] focus:outline-none transition-colors" aria-label="Toggle navigation menu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer Navigation -->
        <div id="mobile-nav" class="hidden lg:hidden bg-[#241A17] border-b border-[#B89A65]/20 px-6 py-6 transition-all duration-300">
          <div class="flex flex-col space-y-4 uppercase tracking-widest text-sm font-light">
            <a href="index.html" class="py-2 border-b border-[#30231F] hover:text-[#B89A65] transition-colors ${isHome ? 'text-[#B89A65] font-medium' : 'text-[#FFFDF9]'}">Home</a>
            <a href="about.html" class="py-2 border-b border-[#30231F] hover:text-[#B89A65] transition-colors ${isAbout ? 'text-[#B89A65] font-medium' : 'text-[#FFFDF9]'}">About</a>
            <a href="shop.html" class="py-2 border-b border-[#30231F] hover:text-[#B89A65] transition-colors ${isShop ? 'text-[#B89A65] font-medium' : 'text-[#FFFDF9]'}">Shop Collection</a>
            <a href="discovery.html" class="py-2 border-b border-[#30231F] hover:text-[#B89A65] transition-colors ${isDiscovery ? 'text-[#B89A65] font-medium' : 'text-[#FFFDF9]'}">Discovery Guide</a>
            <a href="contact.html" class="py-2 hover:text-[#B89A65] transition-colors ${isContact ? 'text-[#B89A65] font-medium' : 'text-[#FFFDF9]'}">Contact</a>
          </div>
          <div class="mt-6 pt-4 border-t border-[#B89A65]/20 flex items-center justify-between text-xs text-[#C9BBAA]">
            <span>Concierge: +1 (800) 892-SCENT</span>
            <span class="text-[#B89A65]">Mon - Sat: 9am - 7pm</span>
          </div>
        </div>
      </header>
    `;

    // Bind Header Events
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
      mobileBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
      });
    }

    const searchTriggers = [document.getElementById('header-search-btn'), document.getElementById('mobile-search-btn')];
    searchTriggers.forEach(btn => {
      if (btn) btn.addEventListener('click', openSearchModal);
    });

    const cartBtn = document.getElementById('header-cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);

    const wishlistBtn = document.getElementById('header-wishlist-btn');
    if (wishlistBtn) wishlistBtn.addEventListener('click', openWishlistModal);

    const accountBtn = document.getElementById('header-account-btn');
    if (accountBtn) accountBtn.addEventListener('click', openAccountModal);
  }

  // Render Consistent Footer
  function renderFooter() {
    const footerContainer = document.getElementById('scentora-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="bg-[#241A17] text-[#F7F1E8] border-t border-[#B89A65]/20 pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Main Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
            
            <!-- Col 1: Brand & Philosophy (span 2 on large) -->
            <div class="lg:col-span-2">
              <a href="index.html" class="inline-flex items-center gap-3.5 group mb-4">
                <div class="w-11 h-11 rounded-full border border-[#B89A65]/50 bg-gradient-to-br from-[#3d2d28] via-[#241A17] to-[#1c1310] flex items-center justify-center shadow-lg group-hover:border-[#B89A65] group-hover:shadow-[0_0_15px_rgba(184,154,101,0.35)] transition-all duration-300 flex-shrink-0">
                  <svg class="w-6 h-6 text-[#B89A65] transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M10 2h4M9 5h6M8 8h8l1 13H7L8 8z"></path>
                    <circle cx="12" cy="14" r="2.5" stroke-width="1.3"></circle>
                  </svg>
                </div>
                <div class="flex flex-col">
                  <span class="font-serif text-3xl tracking-[0.25em] text-[#FFFDF9] uppercase group-hover:text-[#B89A65] transition-colors leading-none">SCENTORA</span>
                  <span class="text-[10px] tracking-[0.4em] text-[#B89A65] uppercase font-light mt-1">Haute Parfumerie & Artistry</span>
                </div>
              </a>
              <p class="text-[#C9BBAA] text-sm leading-relaxed mb-6 max-w-md font-light">
                Crafted in the historic perfume cradles of Grasse and Florence. We marry rare botanical harvests with avant-garde olfactory architecture to create transcendental fragrance journeys.
              </p>
              <!-- Newsletter Subscription Box -->
              <div class="mt-4">
                <h4 class="text-xs tracking-widest uppercase text-[#B89A65] font-medium mb-3">The Scentora Gazette</h4>
                <form id="footer-newsletter-form" class="flex max-w-md" onsubmit="event.preventDefault(); window.handleNewsletterSubmit(this);">
                  <input type="email" required placeholder="Enter your email address..." class="bg-[#30231F] border border-[#B89A65]/30 text-[#FFFDF9] px-4 py-2.5 text-xs rounded-l-md focus:outline-none focus:border-[#B89A65] w-full placeholder-[#C9BBAA]/50">
                  <button type="submit" class="bg-[#B89A65] hover:bg-[#a68955] text-[#30231F] px-5 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-r-md transition-all flex items-center">
                    Join
                  </button>
                </form>
                <p class="text-[11px] text-[#C9BBAA]/70 mt-2">Subscribe for private allocations, invitations and olfactory stories.</p>
              </div>
            </div>

            <!-- Col 2: Quick Links (All 5 Pages) -->
            <div>
              <h4 class="text-xs tracking-widest uppercase text-[#B89A65] font-semibold mb-5">Quick Links</h4>
              <ul class="space-y-3 text-sm text-[#C9BBAA] font-light">
                <li><a href="index.html" class="hover:text-[#B89A65] transition-colors">Home Boutique</a></li>
                <li><a href="about.html" class="hover:text-[#B89A65] transition-colors">Our Brand Story</a></li>
                <li><a href="shop.html" class="hover:text-[#B89A65] transition-colors">Fragrance Collection</a></li>
                <li><a href="discovery.html" class="hover:text-[#B89A65] transition-colors">Discovery Guide & Quiz</a></li>
                <li><a href="contact.html" class="hover:text-[#B89A65] transition-colors">Concierge & Contact</a></li>
              </ul>
            </div>

            <!-- Col 3: Fragrance Families -->
            <div>
              <h4 class="text-xs tracking-widest uppercase text-[#B89A65] font-semibold mb-5">Collections</h4>
              <ul class="space-y-3 text-sm text-[#C9BBAA] font-light">
                <li><a href="shop.html?family=Woody" class="hover:text-[#B89A65] transition-colors">Woody & Oud</a></li>
                <li><a href="shop.html?family=Floral" class="hover:text-[#B89A65] transition-colors">Floral Elegance</a></li>
                <li><a href="shop.html?family=Oriental" class="hover:text-[#B89A65] transition-colors">Oriental & Amber</a></li>
                <li><a href="shop.html?family=Citrus" class="hover:text-[#B89A65] transition-colors">Fresh & Citrus</a></li>
                <li><a href="shop.html?family=Gourmand" class="hover:text-[#B89A65] transition-colors">Gourmand Elixirs</a></li>
                <li><a href="discovery.html#gift-sets" class="hover:text-[#B89A65] transition-colors">Discovery Coffrets</a></li>
              </ul>
            </div>

            <!-- Col 4: Concierge & Client Care -->
            <div>
              <h4 class="text-xs tracking-widest uppercase text-[#B89A65] font-semibold mb-5">Client Care</h4>
              <ul class="space-y-3 text-sm text-[#C9BBAA] font-light">
                <li><span class="block text-xs uppercase tracking-wider text-[#F7F1E8]">Flagship Salon</span> 480 Avenue Montaigne, Paris</li>
                <li><span class="block text-xs uppercase tracking-wider text-[#F7F1E8]">Concierge Phone</span> +1 (800) 892-SCENT</li>
                <li><span class="block text-xs uppercase tracking-wider text-[#F7F1E8]">Private Consultations</span> concierge@scentora-parfum.com</li>
                <li><span class="block text-xs uppercase tracking-wider text-[#F7F1E8]">Shipping & Returns</span> Worldwide Insured Courier</li>
              </ul>
            </div>

          </div>

          <!-- Bottom Bar: Socials & Copyright -->
          <div class="pt-8 border-t border-[#B89A65]/15 flex flex-col md:flex-row items-center justify-between text-xs text-[#C9BBAA] gap-4">
            <div>
              <p>&copy; ${new Date().getFullYear()} SCENTORA Haute Parfumerie Boutique. All Rights Reserved. Artisanal Craftsmanship.</p>
            </div>
            <div class="flex items-center space-x-6 text-[#C9BBAA]">
              <a href="#" class="hover:text-[#B89A65] transition-colors" aria-label="Instagram">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" class="hover:text-[#B89A65] transition-colors" aria-label="Pinterest">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" class="hover:text-[#B89A65] transition-colors" aria-label="Facebook">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // Handle Newsletter Submission
  window.handleNewsletterSubmit = function(form) {
    const input = form.querySelector('input');
    if (input && input.value) {
      showToast('Thank you for joining the Scentora Gazette. Welcome to our private circle.');
      input.value = '';
    }
  };

  // Build Shopping Cart Drawer & Checkout Modal
  function injectShoppingComponents() {
    if (document.getElementById('scentora-cart-drawer')) return;

    const cartHtml = `
      <!-- Cart Drawer Backdrop -->
      <div id="scentora-cart-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-300"></div>

      <!-- Cart Side Drawer -->
      <div id="scentora-cart-drawer" class="fixed top-0 right-0 h-full w-full max-w-md bg-[#30231F] text-[#FFFDF9] z-50 transform translate-x-full transition-transform duration-300 shadow-2xl flex flex-col border-l border-[#B89A65]/30">
        <!-- Cart Header -->
        <div class="p-6 border-b border-[#B89A65]/20 flex items-center justify-between bg-[#241A17]">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-[#B89A65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <h3 class="font-serif text-lg tracking-wider uppercase text-[#FFFDF9]">Your Fragrance Bag</h3>
          </div>
          <button id="close-cart-btn" class="text-[#C9BBAA] hover:text-[#FFFDF9] transition-colors p-1" aria-label="Close cart">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Free Gift Tier Bar -->
        <div class="bg-[#B89A65]/10 px-6 py-2.5 border-b border-[#B89A65]/20 flex items-center justify-between text-xs text-[#C9BBAA]">
          <span>Complimentary sample vial with every order</span>
          <span class="text-[#B89A65] font-medium">Free Global Shipping > $150</span>
        </div>

        <!-- Cart Items List (Scrollable) -->
        <div id="cart-items-container" class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- Dynamically Rendered -->
        </div>

        <!-- Cart Footer / Totals -->
        <div class="p-6 border-t border-[#B89A65]/20 bg-[#241A17] space-y-4">
          <!-- Coupon Code Input -->
          <div class="flex gap-2">
            <input type="text" id="cart-coupon-input" placeholder="Promo code (e.g. SCENTORA15)" class="flex-1 bg-[#30231F] border border-[#B89A65]/30 text-xs px-3 py-2 text-[#FFFDF9] rounded focus:outline-none focus:border-[#B89A65] uppercase">
            <button id="apply-coupon-btn" class="bg-[#B89A65] text-[#30231F] px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#a68955] transition-all">Apply</button>
          </div>
          <div id="applied-coupon-tag" class="hidden text-xs text-[#B89A65] flex items-center justify-between bg-[#B89A65]/10 px-3 py-1.5 rounded">
            <span>Promotion Applied: <strong id="applied-coupon-name"></strong></span>
            <button id="remove-coupon-btn" class="text-xs text-[#FFFDF9] hover:underline">Remove</button>
          </div>

          <!-- Price Summary Breakdown -->
          <div class="space-y-1.5 text-xs text-[#C9BBAA]">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span id="cart-subtotal" class="text-[#FFFDF9] font-medium">$0.00</span>
            </div>
            <div id="discount-row" class="hidden flex justify-between text-[#B89A65]">
              <span>Discount</span>
              <span id="cart-discount">-$0.00</span>
            </div>
            <div class="flex justify-between">
              <span>Insured Luxury Courier</span>
              <span id="cart-shipping" class="text-[#FFFDF9]">Complimentary</span>
            </div>
            <div class="pt-2 border-t border-[#B89A65]/20 flex justify-between text-base font-serif text-[#FFFDF9]">
              <span>Estimated Total</span>
              <span id="cart-grandtotal" class="text-[#B89A65] font-semibold">$0.00</span>
            </div>
          </div>

          <!-- Checkout CTA -->
          <button id="proceed-to-checkout-btn" class="w-full bg-[#B89A65] hover:bg-[#a68955] text-[#30231F] py-3.5 px-6 rounded text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg">
            <span>Proceed to Checkout</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>

      <!-- Checkout Full Modal -->
      <div id="scentora-checkout-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 hidden opacity-0 transition-opacity duration-300 overflow-y-auto">
        <div class="min-h-screen py-10 px-4 sm:px-6 flex items-center justify-center">
          <div class="bg-[#30231F] border border-[#B89A65]/30 text-[#FFFDF9] max-w-4xl w-full rounded-xl shadow-2xl overflow-hidden relative">
            
            <!-- Modal Header -->
            <div class="bg-[#241A17] p-6 border-b border-[#B89A65]/20 flex items-center justify-between">
              <div>
                <span class="text-xs tracking-[0.3em] text-[#B89A65] uppercase block">Encrypted Checkout</span>
                <h3 class="font-serif text-2xl tracking-wider text-[#FFFDF9]">Scentora Bespoke Order</h3>
              </div>
              <button id="close-checkout-btn" class="text-[#C9BBAA] hover:text-[#FFFDF9] transition-colors p-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Checkout Form & Summary Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              <!-- Left Form Details (7 cols) -->
              <form id="checkout-form" class="lg:col-span-7 p-6 sm:p-8 space-y-6">
                <!-- Contact Info -->
                <div>
                  <h4 class="text-xs uppercase tracking-widest text-[#B89A65] font-semibold mb-3 flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#B89A65]/20 border border-[#B89A65] flex items-center justify-center text-[10px] text-[#B89A65]">1</span>
                    Client Information
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label class="block text-[#C9BBAA] mb-1">First Name *</label>
                      <input type="text" required name="firstName" placeholder="Genevieve" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>
                    <div>
                      <label class="block text-[#C9BBAA] mb-1">Last Name *</label>
                      <input type="text" required name="lastName" placeholder="Laurent" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[#C9BBAA] mb-1">Email Address *</label>
                      <input type="email" required name="email" placeholder="g.laurent@luxury.com" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[#C9BBAA] mb-1">Phone Number (For Courier Tracking) *</label>
                      <input type="tel" required name="phone" placeholder="+1 (555) 019-2834" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>
                  </div>
                </div>

                <!-- Shipping Address -->
                <div>
                  <h4 class="text-xs uppercase tracking-widest text-[#B89A65] font-semibold mb-3 flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#B89A65]/20 border border-[#B89A65] flex items-center justify-center text-[10px] text-[#B89A65]">2</span>
                    Shipping Destination
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div class="sm:col-span-2">
                      <label class="block text-[#C9BBAA] mb-1">Street Address *</label>
                      <input type="text" required name="address" placeholder="742 Evergreen Terrace, Penthouse 4" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>
                    <div>
                      <label class="block text-[#C9BBAA] mb-1">City *</label>
                      <input type="text" required name="city" placeholder="New York" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>
                    <div>
                      <label class="block text-[#C9BBAA] mb-1">Postal Code *</label>
                      <input type="text" required name="postalCode" placeholder="10021" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[#C9BBAA] mb-1">Country / Region *</label>
                      <select name="country" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded px-3 py-2 text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="France">France</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Canada">Canada</option>
                        <option value="Singapore">Singapore</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Payment Selection (UPI, Card, Cash on Delivery) -->
                <div>
                  <h4 class="text-xs uppercase tracking-widest text-[#B89A65] font-semibold mb-3 flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#B89A65]/20 border border-[#B89A65] flex items-center justify-center text-[10px] text-[#B89A65]">3</span>
                    Payment Method
                  </h4>
                  <div class="space-y-2 text-xs">
                    <!-- Credit Card Option -->
                    <label class="flex items-center gap-3 p-3 border border-[#B89A65]/30 rounded-lg cursor-pointer hover:border-[#B89A65] bg-[#241A17]/60">
                      <input type="radio" name="paymentMethod" value="card" checked class="accent-[#B89A65]">
                      <div class="flex-1">
                        <span class="font-medium text-[#FFFDF9] block">Credit / Debit Card (Visa, Mastercard, Amex)</span>
                        <span class="text-[11px] text-[#C9BBAA]">Secure 256-bit TLS encrypted bank-grade gateway</span>
                      </div>
                    </label>

                    <!-- Card Details Drawer -->
                    <div id="card-fields-box" class="p-3 bg-[#241A17] border border-[#B89A65]/20 rounded-md space-y-2">
                      <div>
                        <label class="block text-[11px] text-[#C9BBAA] mb-1">Card Number</label>
                        <input type="text" placeholder="4242 •••• •••• 4242" maxlength="19" class="w-full bg-[#30231F] border border-[#B89A65]/30 rounded px-3 py-1.5 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label class="block text-[11px] text-[#C9BBAA] mb-1">Expiry Date</label>
                          <input type="text" placeholder="MM/YY" maxlength="5" class="w-full bg-[#30231F] border border-[#B89A65]/30 rounded px-3 py-1.5 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                        </div>
                        <div>
                          <label class="block text-[11px] text-[#C9BBAA] mb-1">CVV Security Code</label>
                          <input type="password" placeholder="•••" maxlength="4" class="w-full bg-[#30231F] border border-[#B89A65]/30 rounded px-3 py-1.5 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                        </div>
                      </div>
                    </div>

                    <!-- UPI Option -->
                    <label class="flex items-center gap-3 p-3 border border-[#B89A65]/30 rounded-lg cursor-pointer hover:border-[#B89A65] bg-[#241A17]/60">
                      <input type="radio" name="paymentMethod" value="upi" class="accent-[#B89A65]">
                      <div class="flex-1">
                        <span class="font-medium text-[#FFFDF9] block">Instant UPI & QR Code</span>
                        <span class="text-[11px] text-[#C9BBAA]">Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>
                    </label>

                    <!-- UPI input field -->
                    <div id="upi-fields-box" class="hidden p-3 bg-[#241A17] border border-[#B89A65]/20 rounded-md">
                      <label class="block text-[11px] text-[#C9BBAA] mb-1">Enter your Virtual Payment Address (UPI ID)</label>
                      <input type="text" placeholder="username@okhdfcbank" class="w-full bg-[#30231F] border border-[#B89A65]/30 rounded px-3 py-1.5 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#B89A65]">
                    </div>

                    <!-- Cash on Delivery -->
                    <label class="flex items-center gap-3 p-3 border border-[#B89A65]/30 rounded-lg cursor-pointer hover:border-[#B89A65] bg-[#241A17]/60">
                      <input type="radio" name="paymentMethod" value="cod" class="accent-[#B89A65]">
                      <div class="flex-1">
                        <span class="font-medium text-[#FFFDF9] block">Concierge Cash on Delivery</span>
                        <span class="text-[11px] text-[#C9BBAA]">Inspect your package and settle in cash upon delivery</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="pt-4 border-t border-[#B89A65]/20">
                  <button type="submit" class="w-full bg-[#B89A65] hover:bg-[#a68955] text-[#30231F] py-3.5 px-6 rounded text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-xl">
                    Authorize & Complete Order
                  </button>
                  <p class="text-[10px] text-center text-[#C9BBAA] mt-2">By placing your order, you agree to Scentora's Private Delivery Terms & Return Policy.</p>
                </div>
              </form>

              <!-- Right Summary Column (5 cols) -->
              <div class="lg:col-span-5 bg-[#241A17] p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-[#B89A65]/20 flex flex-col justify-between">
                <div>
                  <h4 class="text-xs uppercase tracking-widest text-[#B89A65] font-semibold mb-4">Order Summary</h4>
                  <div id="checkout-items-preview" class="space-y-3 max-h-80 overflow-y-auto pr-1">
                    <!-- Dynamic preview items -->
                  </div>
                  
                  <div class="mt-6 pt-4 border-t border-[#B89A65]/20 space-y-2 text-xs text-[#C9BBAA]">
                    <div class="flex justify-between">
                      <span>Items Subtotal</span>
                      <span id="checkout-subtotal" class="text-[#FFFDF9]">$0.00</span>
                    </div>
                    <div id="checkout-discount-row" class="hidden flex justify-between text-[#B89A65]">
                      <span>Privilege Discount</span>
                      <span id="checkout-discount">-$0.00</span>
                    </div>
                    <div class="flex justify-between">
                      <span>White Glove Courier</span>
                      <span class="text-[#FFFDF9]">Complimentary</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Signature Scentora Box & Ribbons</span>
                      <span class="text-[#B89A65]">Included</span>
                    </div>
                    <div class="pt-3 border-t border-[#B89A65]/30 flex justify-between text-base font-serif text-[#FFFDF9]">
                      <span>Grand Total</span>
                      <span id="checkout-grandtotal" class="text-[#B89A65] font-bold">$0.00</span>
                    </div>
                  </div>
                </div>

                <!-- Luxury Assurance Badges -->
                <div class="mt-6 pt-6 border-t border-[#B89A65]/20 text-[11px] text-[#C9BBAA] space-y-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#B89A65]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    <span>100% Guaranteed Authentic Grasse & Florence Extraits</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#B89A65]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    <span>Climate-controlled insured shipping in bespoke flacon cases</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#B89A65]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    <span>30-Day Flacon Guarantee with Complimentary Returns</span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Order Confirmation Screen (Success State) -->
            <div id="checkout-success-view" class="hidden p-8 sm:p-12 text-center bg-[#30231F] space-y-6">
              <div class="w-20 h-20 mx-auto rounded-full bg-[#B89A65]/20 border border-[#B89A65] flex items-center justify-center text-[#B89A65]">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <span class="text-xs uppercase tracking-[0.3em] text-[#B89A65] font-semibold">Order Confirmed</span>
                <h3 class="font-serif text-3xl text-[#FFFDF9] mt-2 mb-3">Thank You for Experiencing Scentora</h3>
                <p class="text-[#C9BBAA] text-sm max-w-md mx-auto leading-relaxed">
                  Your bespoke fragrance flacons are being hand-inspected, wrapped in silk tissue, and prepared for insured transit from our atelier.
                </p>
              </div>
              <div class="bg-[#241A17] p-5 rounded-lg max-w-md mx-auto border border-[#B89A65]/20 text-xs text-[#C9BBAA] space-y-2">
                <div class="flex justify-between">
                  <span>Order Reference:</span>
                  <span id="confirmed-order-id" class="text-[#FFFDF9] font-mono font-bold tracking-wider">#SC-90281</span>
                </div>
                <div class="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span class="text-[#FFFDF9]">3 - 5 Business Days</span>
                </div>
                <div class="flex justify-between">
                  <span>Confirmation sent to:</span>
                  <span id="confirmed-order-email" class="text-[#B89A65]"></span>
                </div>
              </div>
              <div>
                <button id="success-continue-shopping-btn" class="bg-[#B89A65] hover:bg-[#a68955] text-[#30231F] py-3 px-8 rounded text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg">
                  Continue Exploring
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', cartHtml);

    // Bind Cart Drawer Events
    const backdrop = document.getElementById('scentora-cart-backdrop');
    const closeCartBtn = document.getElementById('close-cart-btn');
    if (backdrop) backdrop.addEventListener('click', closeCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

    // Apply Coupon
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', () => {
        const input = document.getElementById('cart-coupon-input');
        if (!input.value) return;
        const res = window.ScentoraCart.applyCoupon(input.value);
        showToast(res.message);
        if (res.success) input.value = '';
      });
    }

    const removeCouponBtn = document.getElementById('remove-coupon-btn');
    if (removeCouponBtn) {
      removeCouponBtn.addEventListener('click', () => {
        window.ScentoraCart.removeCoupon();
        showToast('Coupon removed.');
      });
    }

    // Proceed to Checkout
    const proceedBtn = document.getElementById('proceed-to-checkout-btn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        const cart = window.ScentoraCart.get();
        if (cart.length === 0) {
          showToast('Your fragrance bag is empty. Explore our collection first.');
          return;
        }
        closeCartDrawer();
        openCheckoutModal();
      });
    }

    // Checkout Close & Form
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

    // Payment Radio Switch
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const cardBox = document.getElementById('card-fields-box');
        const upiBox = document.getElementById('upi-fields-box');
        if (cardBox) cardBox.classList.toggle('hidden', e.target.value !== 'card');
        if (upiBox) upiBox.classList.toggle('hidden', e.target.value !== 'upi');
      });
    });

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    const successContinueBtn = document.getElementById('success-continue-shopping-btn');
    if (successContinueBtn) {
      successContinueBtn.addEventListener('click', () => {
        closeCheckoutModal();
        const successView = document.getElementById('checkout-success-view');
        if (successView) successView.classList.add('hidden');
        if (checkoutForm) checkoutForm.classList.remove('hidden');
        window.location.href = 'shop.html';
      });
    }
  }

  // Update Cart UI Counts & Drawer Items
  function updateCartUI() {
    const cart = window.ScentoraCart.get();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }

    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="h-64 flex flex-col items-center justify-center text-center space-y-3">
          <div class="w-16 h-16 rounded-full bg-[#B89A65]/10 flex items-center justify-center text-[#B89A65]">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <p class="text-sm text-[#C9BBAA]">Your shopping bag is currently empty.</p>
          <a href="shop.html" class="inline-block mt-2 bg-[#B89A65]/20 hover:bg-[#B89A65]/30 text-[#FFFDF9] border border-[#B89A65]/50 px-5 py-2 rounded text-xs uppercase tracking-widest font-medium transition-colors">
            Discover Fragrances
          </a>
        </div>
      `;
    } else {
      container.innerHTML = cart.map(item => `
        <div class="flex gap-4 p-3.5 bg-[#241A17] rounded-lg border border-[#B89A65]/15 items-center">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-20 object-cover rounded bg-[#1a1311] border border-[#B89A65]/20">
          <div class="flex-1 min-w-0">
            <h4 class="font-serif text-sm text-[#FFFDF9] truncate">${item.name}</h4>
            <p class="text-[11px] text-[#B89A65] tracking-wider">${item.subtitle || 'Eau de Parfum'} • ${item.size}</p>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center border border-[#B89A65]/30 rounded bg-[#30231F]">
                <button onclick="window.ScentoraCart.updateQuantity('${item.id}', '${item.size}', -1)" class="px-2 py-0.5 text-xs text-[#C9BBAA] hover:text-[#FFFDF9]">-</button>
                <span class="px-2 text-xs text-[#FFFDF9]">${item.quantity}</span>
                <button onclick="window.ScentoraCart.updateQuantity('${item.id}', '${item.size}', 1)" class="px-2 py-0.5 text-xs text-[#C9BBAA] hover:text-[#FFFDF9]">+</button>
              </div>
              <span class="text-xs font-semibold text-[#FFFDF9]">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
          <button onclick="window.ScentoraCart.removeItem('${item.id}', '${item.size}')" class="text-[#C9BBAA]/60 hover:text-red-400 p-1" title="Remove">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `).join('');
    }

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Coupon logic
    let discount = 0;
    const storedCoupon = sessionStorage.getItem('scentora_coupon');
    const couponTag = document.getElementById('applied-coupon-tag');
    const couponName = document.getElementById('applied-coupon-name');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('cart-discount');

    if (storedCoupon && subtotal > 0) {
      try {
        const { code, rate } = JSON.parse(storedCoupon);
        discount = subtotal * rate;
        if (couponTag) couponTag.classList.remove('hidden');
        if (couponName) couponName.textContent = `${code} (${Math.round(rate * 100)}% Off)`;
        if (discountRow) discountRow.classList.remove('hidden');
        if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
      } catch(e) {}
    } else {
      if (couponTag) couponTag.classList.add('hidden');
      if (discountRow) discountRow.classList.add('hidden');
    }

    const grandTotal = Math.max(0, subtotal - discount);
    const grandtotalEl = document.getElementById('cart-grandtotal');
    if (grandtotalEl) grandtotalEl.textContent = `$${grandTotal.toFixed(2)}`;
  }

  // Update Wishlist Badge
  function updateWishlistUI() {
    const wishlist = window.ScentoraWishlist.get();
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      badge.textContent = wishlist.length;
      badge.classList.toggle('hidden', wishlist.length === 0);
    }
  }

  // Open / Close Cart Drawer
  function openCartDrawer() {
    updateCartUI();
    const backdrop = document.getElementById('scentora-cart-backdrop');
    const drawer = document.getElementById('scentora-cart-drawer');
    if (backdrop && drawer) {
      backdrop.style.display = 'block';
      backdrop.classList.remove('hidden');
      drawer.classList.add('drawer-open');
      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        drawer.classList.remove('translate-x-full');
      });
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    const backdrop = document.getElementById('scentora-cart-backdrop');
    const drawer = document.getElementById('scentora-cart-drawer');
    if (backdrop && drawer) {
      backdrop.classList.add('opacity-0');
      drawer.classList.remove('drawer-open');
      drawer.classList.add('translate-x-full');
      setTimeout(() => {
        backdrop.style.display = 'none';
        backdrop.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }
  }

  // Open / Close Checkout Modal
  function openCheckoutModal() {
    const modal = document.getElementById('scentora-checkout-modal');
    if (!modal) return;

    // Populate checkout review
    const cart = window.ScentoraCart.get();
    const previewContainer = document.getElementById('checkout-items-preview');
    if (previewContainer) {
      previewContainer.innerHTML = cart.map(item => `
        <div class="flex items-center gap-3 py-2 border-b border-[#B89A65]/10">
          <img src="${item.image}" alt="${item.name}" class="w-12 h-14 object-cover rounded bg-[#1a1311]">
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-serif text-[#FFFDF9] truncate">${item.name}</h5>
            <p class="text-[10px] text-[#B89A65]">${item.size} × ${item.quantity}</p>
          </div>
          <span class="text-xs font-semibold text-[#FFFDF9]">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    const storedCoupon = sessionStorage.getItem('scentora_coupon');
    if (storedCoupon) {
      try {
        const { rate } = JSON.parse(storedCoupon);
        discount = subtotal * rate;
      } catch(e) {}
    }

    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;

    const discountRow = document.getElementById('checkout-discount-row');
    const discountEl = document.getElementById('checkout-discount');
    if (discount > 0 && discountRow && discountEl) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `-$${discount.toFixed(2)}`;
    } else if (discountRow) {
      discountRow.classList.add('hidden');
    }

    const grandtotalEl = document.getElementById('checkout-grandtotal');
    if (grandtotalEl) grandtotalEl.textContent = `$${Math.max(0, subtotal - discount).toFixed(2)}`;

    modal.style.display = 'block';
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('scentora-checkout-modal');
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }
  }

  // Handle Checkout Submission
  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const payment = formData.get('paymentMethod');

    // Generate random luxury order reference
    const orderRef = '#SC-' + Math.floor(100000 + Math.random() * 900000);

    // Save order in localStorage history
    const cart = window.ScentoraCart.get();
    const orders = JSON.parse(localStorage.getItem('scentora_order_history') || '[]');
    orders.push({
      orderRef,
      date: new Date().toISOString(),
      items: cart,
      email,
      paymentMethod: payment
    });
    localStorage.setItem('scentora_order_history', JSON.stringify(orders));

    // Clear cart
    window.ScentoraCart.clear();

    // Show Confirmation View
    form.classList.add('hidden');
    const successView = document.getElementById('checkout-success-view');
    const confirmedId = document.getElementById('confirmed-order-id');
    const confirmedEmail = document.getElementById('confirmed-order-email');

    if (confirmedId) confirmedId.textContent = orderRef;
    if (confirmedEmail) confirmedEmail.textContent = email;
    if (successView) successView.classList.remove('hidden');
  }

  // Global Quick View Modal
  window.openQuickView = function(productId) {
    const product = (window.SCENTORA_PRODUCTS || []).find(p => p.id === productId);
    if (!product) return;

    let modal = document.getElementById('scentora-quickview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'scentora-quickview-modal';
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 hidden opacity-0';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-[#30231F] border border-[#B89A65]/40 text-[#FFFDF9] max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl relative">
        <button onclick="window.closeQuickView()" class="absolute top-4 right-4 z-10 text-[#C9BBAA] hover:text-[#FFFDF9] bg-[#241A17]/80 rounded-full p-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="h-80 md:h-full relative overflow-hidden bg-[#1a1311]">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
            <span class="absolute top-4 left-4 bg-[#30231F]/90 text-[#B89A65] border border-[#B89A65]/40 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded">
              ${product.family}
            </span>
          </div>
          <div class="p-6 md:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center gap-1 text-[#B89A65] text-xs mb-1">
                <span>★ ★ ★ ★ ★</span>
                <span class="text-[#C9BBAA] ml-1">(${product.rating})</span>
              </div>
              <h3 class="font-serif text-2xl text-[#FFFDF9]">${product.name}</h3>
              <p class="text-xs text-[#B89A65] tracking-widest uppercase mb-3">${product.subtitle}</p>
              <p class="text-xs text-[#C9BBAA] leading-relaxed mb-4">${product.description}</p>
              
              <!-- Notes Pill breakdown -->
              <div class="space-y-2 text-[11px] bg-[#241A17] p-3 rounded border border-[#B89A65]/15">
                <div><strong class="text-[#B89A65]">Top:</strong> <span class="text-[#FFFDF9]">${product.topNotes.join(', ')}</span></div>
                <div><strong class="text-[#B89A65]">Heart:</strong> <span class="text-[#FFFDF9]">${product.heartNotes.join(', ')}</span></div>
                <div><strong class="text-[#B89A65]">Base:</strong> <span class="text-[#FFFDF9]">${product.baseNotes.join(', ')}</span></div>
              </div>
            </div>

            <!-- Size Selection & Add to Cart -->
            <div class="space-y-4 pt-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-[#C9BBAA]">Select Flacon Size:</span>
                <div class="flex gap-2" id="quickview-size-selector">
                  <button type="button" data-size="50ml" class="px-2.5 py-1 border border-[#B89A65]/30 rounded hover:border-[#B89A65] text-xs">50ml</button>
                  <button type="button" data-size="100ml" class="px-2.5 py-1 border border-[#B89A65] bg-[#B89A65]/20 text-[#FFFDF9] rounded text-xs font-semibold">100ml</button>
                  <button type="button" data-size="200ml" class="px-2.5 py-1 border border-[#B89A65]/30 rounded hover:border-[#B89A65] text-xs">200ml</button>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-[#B89A65]/20">
                <span class="font-serif text-2xl text-[#B89A65]" id="quickview-price-display">$${product.price}</span>
                <button id="quickview-add-cart-btn" class="bg-[#B89A65] hover:bg-[#a68955] text-[#30231F] px-6 py-2.5 rounded text-xs uppercase tracking-widest font-semibold transition-all">
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
    });

    // Handle Size Buttons
    let selectedSize = '100ml';
    const sizeBtns = modal.querySelectorAll('#quickview-size-selector button');
    const priceDisplay = modal.querySelector('#quickview-price-display');

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => {
          b.className = 'px-2.5 py-1 border border-[#B89A65]/30 rounded hover:border-[#B89A65] text-xs';
        });
        btn.className = 'px-2.5 py-1 border border-[#B89A65] bg-[#B89A65]/20 text-[#FFFDF9] rounded text-xs font-semibold';
        selectedSize = btn.dataset.size;
        let p = product.price;
        if (selectedSize === '50ml') p = Math.round(product.price * 0.65);
        if (selectedSize === '200ml') p = Math.round(product.price * 1.6);
        if (priceDisplay) priceDisplay.textContent = `$${p}`;
      });
    });

    const addBtn = modal.querySelector('#quickview-add-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.ScentoraCart.addItem(product, selectedSize, 1);
        window.closeQuickView();
      });
    }
  };

  window.closeQuickView = function() {
    const modal = document.getElementById('scentora-quickview-modal');
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
  };

  // Search Modal
  function openSearchModal() {
    let modal = document.getElementById('scentora-search-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'scentora-search-modal';
      modal.className = 'fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center pt-20 px-4 transition-opacity duration-300 hidden opacity-0';
      modal.innerHTML = `
        <div class="bg-[#30231F] border border-[#B89A65]/40 text-[#FFFDF9] max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl p-6 relative">
          <div class="flex items-center justify-between pb-4 border-b border-[#B89A65]/20 mb-4">
            <span class="text-xs uppercase tracking-widest text-[#B89A65] font-semibold">Fragrance Search</span>
            <button id="close-search-modal-btn" class="text-[#C9BBAA] hover:text-[#FFFDF9]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="relative">
            <input type="text" id="live-search-input" placeholder="Search by name, notes (oud, rose, amber), or occasion..." class="w-full bg-[#241A17] border border-[#B89A65]/40 rounded-lg px-4 py-3 text-sm text-[#FFFDF9] focus:outline-none focus:border-[#B89A65] placeholder-[#C9BBAA]/50">
          </div>
          <div id="search-results-box" class="mt-4 max-h-80 overflow-y-auto space-y-2">
            <p class="text-xs text-[#C9BBAA] text-center py-6">Type to discover olfactory creations...</p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#close-search-modal-btn').addEventListener('click', closeSearchModal);
      const searchInput = modal.querySelector('#live-search-input');
      const resultsBox = modal.querySelector('#search-results-box');

      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          resultsBox.innerHTML = '<p class="text-xs text-[#C9BBAA] text-center py-6">Type to discover olfactory creations...</p>';
          return;
        }

        const matches = (window.SCENTORA_PRODUCTS || []).filter(p => {
          return p.name.toLowerCase().includes(query) ||
                 p.family.toLowerCase().includes(query) ||
                 p.topNotes.some(n => n.toLowerCase().includes(query)) ||
                 p.heartNotes.some(n => n.toLowerCase().includes(query)) ||
                 p.baseNotes.some(n => n.toLowerCase().includes(query)) ||
                 p.description.toLowerCase().includes(query);
        });

        if (matches.length === 0) {
          resultsBox.innerHTML = `<p class="text-xs text-[#C9BBAA] text-center py-6">No creations found matching "${query}".</p>`;
          return;
        }

        resultsBox.innerHTML = matches.map(p => `
          <div class="flex items-center gap-3 p-2.5 rounded-lg bg-[#241A17] hover:bg-[#2c201d] transition-colors border border-[#B89A65]/10 cursor-pointer" onclick="window.location.href='shop.html?search=${encodeURIComponent(p.name)}'">
            <img src="${p.image}" alt="${p.name}" class="w-12 h-14 object-cover rounded bg-[#1a1311]">
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-serif text-[#FFFDF9] truncate">${p.name}</h5>
              <p class="text-[11px] text-[#B89A65]">${p.family} • $${p.price}</p>
              <p class="text-[10px] text-[#C9BBAA] truncate">Notes: ${p.topNotes[0]}, ${p.heartNotes[0]}, ${p.baseNotes[0]}</p>
            </div>
            <button onclick="event.stopPropagation(); window.openQuickView('${p.id}')" class="text-xs text-[#B89A65] border border-[#B89A65]/40 px-3 py-1 rounded hover:bg-[#B89A65] hover:text-[#30231F] transition-colors">
              Quick View
            </button>
          </div>
        `).join('');
      });
    }

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      const input = modal.querySelector('#live-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
    });
  }

  function closeSearchModal() {
    const modal = document.getElementById('scentora-search-modal');
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
  }

  // Wishlist Modal
  function openWishlistModal() {
    const wishlist = window.ScentoraWishlist.get();
    let modal = document.getElementById('scentora-wishlist-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'scentora-wishlist-modal';
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 hidden opacity-0';
      document.body.appendChild(modal);
    }

    const items = (window.SCENTORA_PRODUCTS || []).filter(p => wishlist.includes(p.id));

    modal.innerHTML = `
      <div class="bg-[#30231F] border border-[#B89A65]/40 text-[#FFFDF9] max-w-xl w-full rounded-xl overflow-hidden shadow-2xl p-6 relative">
        <div class="flex items-center justify-between pb-4 border-b border-[#B89A65]/20 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-[#B89A65]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
            <h3 class="font-serif text-lg tracking-wider uppercase text-[#FFFDF9]">Saved Desires (${items.length})</h3>
          </div>
          <button id="close-wishlist-modal-btn" class="text-[#C9BBAA] hover:text-[#FFFDF9]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto space-y-3">
          ${items.length === 0 ? `
            <div class="text-center py-8 text-sm text-[#C9BBAA]">
              <p>You haven't saved any fragrance creations yet.</p>
              <a href="shop.html" class="inline-block mt-3 text-xs uppercase tracking-widest text-[#B89A65] underline hover:text-[#FFFDF9]">Explore Fragrances</a>
            </div>
          ` : items.map(p => `
            <div class="flex items-center gap-3 p-3 bg-[#241A17] rounded-lg border border-[#B89A65]/15">
              <img src="${p.image}" alt="${p.name}" class="w-14 h-16 object-cover rounded bg-[#1a1311]">
              <div class="flex-1 min-w-0">
                <h5 class="text-sm font-serif text-[#FFFDF9] truncate">${p.name}</h5>
                <p class="text-xs text-[#B89A65]">$${p.price}</p>
              </div>
              <button onclick="window.ScentoraCart.addItem(window.SCENTORA_PRODUCTS.find(i=>i.id==='${p.id}'));" class="bg-[#B89A65] text-[#30231F] px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#a68955] transition-colors">
                Add to Bag
              </button>
              <button onclick="window.ScentoraWishlist.toggle('${p.id}'); openWishlistModal();" class="text-[#C9BBAA] hover:text-red-400 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.remove('opacity-0'));
    modal.querySelector('#close-wishlist-modal-btn').addEventListener('click', () => {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    });
  }

  // Account, Login & Signup Modal System
  function openAccountModal() {
    let modal = document.getElementById('scentora-account-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'scentora-account-modal';
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 hidden opacity-0';
      document.body.appendChild(modal);
    }

    const currentUser = JSON.parse(localStorage.getItem('scentora_current_user') || 'null');
    const orders = JSON.parse(localStorage.getItem('scentora_order_history') || '[]');

    if (currentUser) {
      // User is logged in: Display Account Dashboard & Orders
      modal.innerHTML = `
        <div class="bg-[#30231F] border border-[#B89A65]/40 text-[#FFFDF9] max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 relative">
          <div class="flex items-center justify-between pb-4 border-b border-[#B89A65]/20 mb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#B89A65]/20 border border-[#B89A65] flex items-center justify-center text-[#B89A65] font-serif text-base font-bold">
                ${currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 class="font-serif text-xl tracking-wider text-[#FFFDF9]">${currentUser.name}</h3>
                <p class="text-[10px] text-[#B89A65] uppercase tracking-widest">${currentUser.email}</p>
              </div>
            </div>
            <button id="close-account-modal-btn" class="text-[#C9BBAA] hover:text-[#FFFDF9] p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="bg-[#241A17] p-4 rounded-xl border border-[#B89A65]/15 text-xs text-[#C9BBAA] space-y-1">
              <span class="text-[#FFFDF9] font-medium block">VIP Circle Privileges</span>
              <p>• Complimentary white-glove international shipping on all allocations</p>
              <p>• Private access to annual Grand Cru reserve releases</p>
              <p>• Dedicated personal master perfumer consultation</p>
            </div>

            <div>
              <h4 class="text-xs uppercase tracking-widest text-[#B89A65] font-semibold mb-2">Order History (${orders.length})</h4>
              <div class="max-h-44 overflow-y-auto space-y-2 pr-1">
                ${orders.length === 0 ? `
                  <p class="text-xs text-[#C9BBAA] text-center py-4">No past orders registered yet.</p>
                ` : orders.map(ord => `
                  <div class="bg-[#241A17] p-3 rounded-lg border border-[#B89A65]/15 text-xs flex justify-between items-center">
                    <div>
                      <span class="font-bold text-[#FFFDF9]">${ord.orderRef}</span>
                      <span class="block text-[10px] text-[#C9BBAA]">${new Date(ord.date).toLocaleDateString()} • ${ord.items.length} items</span>
                    </div>
                    <span class="text-[#B89A65] text-[11px] uppercase tracking-wider font-semibold">In Transit</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="pt-3 border-t border-[#B89A65]/20 flex justify-between items-center">
              <button onclick="window.handleLogout()" class="text-xs text-red-400 hover:underline">
                Sign Out
              </button>
              <a href="shop.html" class="bg-[#B89A65] text-[#30231F] px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#a68955] transition-colors">
                Explore Scents
              </a>
            </div>
          </div>
        </div>
      `;
    } else {
      // User is not logged in: Show Interactive Login & Signup Tabs
      modal.innerHTML = `
        <div class="bg-[#30231F] border border-[#B89A65]/40 text-[#FFFDF9] max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 relative">
          <!-- Close button -->
          <button id="close-account-modal-btn" class="absolute top-5 right-5 text-[#C9BBAA] hover:text-[#FFFDF9] transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <!-- Top Brand Mark -->
          <div class="text-center mb-6">
            <span class="text-[10px] uppercase tracking-[0.3em] text-[#B89A65] font-semibold block mb-1">Maison Scentora</span>
            <h3 class="font-serif text-2xl tracking-wider text-[#FFFDF9]">Client Portal</h3>
          </div>

          <!-- Switch Tabs: Sign In / Create Account -->
          <div class="flex border-b border-[#B89A65]/20 mb-6 text-xs uppercase tracking-widest font-medium">
            <button id="tab-login-btn" onclick="window.switchAuthTab('login')" class="flex-1 pb-3 text-[#B89A65] border-b-2 border-[#B89A65] transition-colors">
              Sign In
            </button>
            <button id="tab-signup-btn" onclick="window.switchAuthTab('signup')" class="flex-1 pb-3 text-[#C9BBAA] hover:text-[#FFFDF9] border-b-2 border-transparent transition-colors">
              Create Account
            </button>
          </div>

          <!-- LOGIN VIEW -->
          <form id="scentora-login-form" class="space-y-4 text-xs" onsubmit="event.preventDefault(); window.handleLogin(this);">
            <div>
              <label class="block text-[#C9BBAA] mb-1.5 uppercase tracking-wider text-[11px]">Email Address</label>
              <input type="email" required name="email" placeholder="client@luxury.com" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded-lg px-4 py-2.5 text-sm text-[#FFFDF9] focus:outline-none focus:border-[#B89A65] placeholder-[#C9BBAA]/40 transition-colors">
            </div>
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-[#C9BBAA] uppercase tracking-wider text-[11px]">Password</label>
                <a href="#" onclick="event.preventDefault(); showToast('Password reset link dispatched to your email.');" class="text-[10px] text-[#B89A65] hover:underline">Forgot?</a>
              </div>
              <input type="password" required name="password" placeholder="••••••••" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded-lg px-4 py-2.5 text-sm text-[#FFFDF9] focus:outline-none focus:border-[#B89A65] placeholder-[#C9BBAA]/40 transition-colors">
            </div>

            <div class="pt-2">
              <button type="submit" class="w-full bg-[#B89A65] hover:bg-[#a68955] text-[#30231F] py-3 rounded-lg text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg">
                Enter Atelier
              </button>
            </div>
            <p class="text-[11px] text-[#C9BBAA] text-center pt-2">
              New patron? <button type="button" onclick="window.switchAuthTab('signup')" class="text-[#B89A65] underline">Create your account</button>
            </p>
          </form>

          <!-- SIGNUP VIEW (Hidden by default) -->
          <form id="scentora-signup-form" class="space-y-3 text-xs hidden" onsubmit="event.preventDefault(); window.handleSignup(this);">
            <div>
              <label class="block text-[#C9BBAA] mb-1 uppercase tracking-wider text-[11px]">Full Name</label>
              <input type="text" required name="name" placeholder="Countess Eleanor" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded-lg px-4 py-2.5 text-sm text-[#FFFDF9] focus:outline-none focus:border-[#B89A65] placeholder-[#C9BBAA]/40 transition-colors">
            </div>
            <div>
              <label class="block text-[#C9BBAA] mb-1 uppercase tracking-wider text-[11px]">Email Address</label>
              <input type="email" required name="email" placeholder="eleanor@domain.com" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded-lg px-4 py-2.5 text-sm text-[#FFFDF9] focus:outline-none focus:border-[#B89A65] placeholder-[#C9BBAA]/40 transition-colors">
            </div>
            <div>
              <label class="block text-[#C9BBAA] mb-1 uppercase tracking-wider text-[11px]">Password</label>
              <input type="password" required minlength="6" name="password" placeholder="At least 6 characters" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded-lg px-4 py-2.5 text-sm text-[#FFFDF9] focus:outline-none focus:border-[#B89A65] placeholder-[#C9BBAA]/40 transition-colors">
            </div>
            <div>
              <label class="block text-[#C9BBAA] mb-1 uppercase tracking-wider text-[11px]">Preferred Olfactory Realm</label>
              <select name="realm" class="w-full bg-[#241A17] border border-[#B89A65]/30 rounded-lg px-4 py-2.5 text-sm text-[#FFFDF9] focus:outline-none focus:border-[#B89A65] transition-colors">
                <option value="Woody & Resins">Woody & Oud</option>
                <option value="Floral Elegance">Floral & Rose</option>
                <option value="Fresh & Citrus">Fresh & Citrus</option>
                <option value="Oriental & Amber">Oriental & Amber</option>
                <option value="Gourmand">Gourmand Elixirs</option>
              </select>
            </div>

            <div class="pt-2">
              <button type="submit" class="w-full bg-[#B89A65] hover:bg-[#a68955] text-[#30231F] py-3 rounded-lg text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg">
                Join Scentora Circle
              </button>
            </div>
            <p class="text-[11px] text-[#C9BBAA] text-center pt-2">
              Already have an account? <button type="button" onclick="window.switchAuthTab('login')" class="text-[#B89A65] underline">Sign In</button>
            </p>
          </form>

        </div>
      `;
    }

    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.remove('opacity-0'));
    modal.querySelector('#close-account-modal-btn').addEventListener('click', closeAccountModal);
  }

  function closeAccountModal() {
    const modal = document.getElementById('scentora-account-modal');
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }
  }

  // Switch between Login and Signup tabs
  window.switchAuthTab = function(tab) {
    const loginForm = document.getElementById('scentora-login-form');
    const signupForm = document.getElementById('scentora-signup-form');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabSignup = document.getElementById('tab-signup-btn');

    if (tab === 'login') {
      if (loginForm) loginForm.classList.remove('hidden');
      if (signupForm) signupForm.classList.add('hidden');
      if (tabLogin) tabLogin.className = 'flex-1 pb-3 text-[#B89A65] border-b-2 border-[#B89A65] transition-colors';
      if (tabSignup) tabSignup.className = 'flex-1 pb-3 text-[#C9BBAA] hover:text-[#FFFDF9] border-b-2 border-transparent transition-colors';
    } else {
      if (loginForm) loginForm.classList.add('hidden');
      if (signupForm) signupForm.classList.remove('hidden');
      if (tabSignup) tabSignup.className = 'flex-1 pb-3 text-[#B89A65] border-b-2 border-[#B89A65] transition-colors';
      if (tabLogin) tabLogin.className = 'flex-1 pb-3 text-[#C9BBAA] hover:text-[#FFFDF9] border-b-2 border-transparent transition-colors';
    }
  };

  // Handle Login submission
  window.handleLogin = function(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const user = {
      name: email.split('@')[0],
      email: email,
      joined: new Date().toISOString()
    };
    localStorage.setItem('scentora_current_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.name}. You are signed in.`);
    openAccountModal(); // Re-render as logged in dashboard
  };

  // Handle Signup submission
  window.handleSignup = function(form) {
    const formData = new FormData(form);
    const user = {
      name: formData.get('name'),
      email: formData.get('email'),
      realm: formData.get('realm'),
      joined: new Date().toISOString()
    };
    localStorage.setItem('scentora_current_user', JSON.stringify(user));
    showToast(`Welcome to Scentora, ${user.name}. Your account has been created.`);
    openAccountModal(); // Re-render as logged in dashboard
  };

  // Handle Logout
  window.handleLogout = function() {
    localStorage.removeItem('scentora_current_user');
    showToast('You have signed out of your account.');
    openAccountModal(); // Re-render as login form
  };

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    injectShoppingComponents();
    updateCartUI();
    updateWishlistUI();

    // Init AOS if available
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 900,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
      });
    }

    // Floating Back to Top Button on Scroll (Bottom-Right Corner)
    injectFloatingBackToTop();
  });

  function injectFloatingBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'scentora-floating-back-to-top';
    btn.setAttribute('aria-label', 'Back to top of page');
    btn.setAttribute('title', 'Back to top');
    btn.className = 'fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#30231F] text-[#B89A65] border border-[#B89A65]/50 shadow-2xl flex items-center justify-center transition-all duration-300 opacity-0 pointer-events-none translate-y-3 hover:bg-[#B89A65] hover:text-[#30231F] hover:scale-110';
    btn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
      </svg>
    `;
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
      } else {
        btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
      }
    });
  }

})();


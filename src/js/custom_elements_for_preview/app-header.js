export class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.isMenuOpen = false;
  }

  connectedCallback() {
    if (this.hasAttribute("rendered")) return;

    this.render();
    this.setupEventListeners();
    this.setAttribute("rendered", "true");
  }

  disconnectedCallback() {
    this.cleanup();
  }

  render() {
    this.innerHTML = `
      <!-- Header Component -->
      <header class="header">
        <div class="header__logo">
          <a href="/">
            <img src="./images/logo_with_text.svg" alt="Real Estate" loading="lazy" />
          </a>
        </div>
        <div class="header__actions">
          <a href="/search.html" class="header__action-btn" aria-label="Search">
            <i class="bi bi-search text-brand-turquoise"></i>
          </a>
          <a href="/collections.html" class="header__action-btn" aria-label="Favorites">
            <i class="bi bi-heart text-brand-bright-pink"></i>
          </a>
          <button class="header__action-btn js-menu-trigger" aria-label="Menu">
            <i class="bi bi-list text-brand-dark-navy"></i>
          </button>
        </div>
      </header>

      <!-- Mobile Menu -->
      <nav class="mobile-menu">
        <div class="mobile-menu__header">
          <button class="mobile-menu__close js-menu-close" aria-label="Close menu">
            <i class="bi bi-x-lg text-brand-dark-navy"></i>
          </button>
          <div class="header__logo">
            <img src="./images/logo_with_text.svg" alt="Real Estate" loading="lazy" />
          </div>
        </div>
        <ul class="mobile-menu__list">
          <li class="mobile-menu__item">
            <a href="/" class="mobile-menu__link">
              <span class="text-brand-lime">Главная</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/search.html" class="mobile-menu__link">
              <span class="text-light-gray-30">Поиск недвижимости</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/my-advertisements.html" class="mobile-menu__link">
              <span class="text-light-gray-30">Мои объявления</span>
            </a>
          </li>
        </ul>
        
        <div class="mobile-menu__app-description">
          <p class="text-end">
            <span class="text-brand-turquoise fw-bold">GoAnyTime</span> — приложение, которое делает простым и удобным поиск объектов недвижимости
          </p>
        </div>
      </nav>

      <!-- Overlay for mobile menu -->
      <div class="overlay js-overlay"></div>
    `;
    this.cacheElements();
  }
  cacheElements() {
    this.menuTrigger = this.querySelector(".js-menu-trigger");
    this.menuClose = this.querySelector(".js-menu-close");
    this.overlay = this.querySelector(".js-overlay");
    this.mobileMenu = this.querySelector(".mobile-menu");
  }
  setupEventListeners() {
    // Cache DOM elements
    this.menuTrigger = this.querySelector(".js-menu-trigger");
    this.menuClose = this.querySelector(".js-menu-close");
    this.overlay = this.querySelector(".js-overlay");
    this.mobileMenu = this.querySelector(".mobile-menu");

    // Bind event handlers
    this.handleMenuOpen = this.openMenu.bind(this);
    this.handleMenuClose = this.closeMenu.bind(this);
    this.handleKeyDown = this.onKeyDown.bind(this);

    // Add event listeners
    this.menuTrigger?.addEventListener("click", this.handleMenuOpen);
    this.menuClose?.addEventListener("click", this.handleMenuClose);
    this.overlay?.addEventListener("click", this.handleMenuClose);

    // Close menu with Escape key
    document.addEventListener("keydown", this.handleKeyDown);
  }

  openMenu() {
    console.log("AppHeader openMenu");
    this.isMenuOpen = true;
    this.updateMenuState();

    // Focus management for accessibility
    setTimeout(() => {
      this.menuClose?.focus();
    }, 100);
  }

  closeMenu() {
    console.log("AppHeader closeMenu");
    this.isMenuOpen = false;
    this.updateMenuState();

    // Return focus to menu trigger
    this.menuTrigger?.focus();
  }

  onKeyDown(event) {
    if (event.key === "Escape" && this.isMenuOpen) {
      this.closeMenu();
    }
  }

  updateMenuState() {
    const method = this.isMenuOpen ? "add" : "remove";

    // Update classes
    this.mobileMenu?.classList[method]("is-active");
    this.overlay?.classList[method]("is-active");
    document.body.classList[method]("menu-open");

    // Update ARIA attributes for accessibility
    this.menuTrigger?.setAttribute("aria-expanded", this.isMenuOpen.toString());
    this.mobileMenu?.setAttribute("aria-hidden", (!this.isMenuOpen).toString());

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? "hidden" : "";
  }

  cleanup() {
    // Remove event listeners to prevent memory leaks
    this.menuTrigger?.removeEventListener("click", this.handleMenuOpen);
    this.menuClose?.removeEventListener("click", this.handleMenuClose);
    this.overlay?.removeEventListener("click", this.handleMenuClose);
    document.removeEventListener("keydown", this.handleKeyDown);

    // Reset body styles
    document.body.style.overflow = "";
    document.body.classList.remove("menu-open");
  }

  // Public API methods
  toggle() {
    this.isMenuOpen ? this.closeMenu() : this.openMenu();
  }

  get menuState() {
    return this.isMenuOpen;
  }
}

/**
 * Header Component Functionality
 * Управляет мобильным меню и взаимодействием с header
 */
export class HeaderManager {
  constructor(container) {
    this.container = container;
    this.isMenuOpen = false;
    this.elements = {};

    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
  }

  cacheElements() {
    this.elements = {
      menuTrigger: this.container.querySelector(".js-menu-trigger"),
      menuClose: this.container.querySelector(".js-menu-close"),
      overlay: this.container.querySelector(".js-overlay"),
      mobileMenu: this.container.querySelector(".mobile-menu"),
    };
  }

  setupEventListeners() {
    // Bind event handlers
    this.handleMenuOpen = this.openMenu.bind(this);
    this.handleMenuClose = this.closeMenu.bind(this);
    this.handleKeyDown = this.onKeyDown.bind(this);

    // Add event listeners
    this.elements.menuTrigger?.addEventListener("click", this.handleMenuOpen);
    this.elements.menuClose?.addEventListener("click", this.handleMenuClose);
    this.elements.overlay?.addEventListener("click", this.handleMenuClose);

    // Close menu with Escape key
    document.addEventListener("keydown", this.handleKeyDown);
  }

  openMenu() {
    console.log("Header openMenu");
    this.isMenuOpen = true;
    this.updateMenuState();

    // Focus management for accessibility
    setTimeout(() => {
      this.elements.menuClose?.focus();
    }, 100);
  }

  closeMenu() {
    console.log("Header closeMenu");
    this.isMenuOpen = false;
    this.updateMenuState();

    // Return focus to menu trigger
    this.elements.menuTrigger?.focus();
  }

  onKeyDown(event) {
    if (event.key === "Escape" && this.isMenuOpen) {
      this.closeMenu();
    }
  }

  updateMenuState() {
    const method = this.isMenuOpen ? "add" : "remove";

    // Update classes
    this.elements.mobileMenu?.classList[method]("is-active");
    this.elements.overlay?.classList[method]("is-active");
    document.body.classList[method]("menu-open");

    // Update ARIA attributes for accessibility
    this.elements.menuTrigger?.setAttribute(
      "aria-expanded",
      this.isMenuOpen.toString()
    );
    this.elements.mobileMenu?.setAttribute(
      "aria-hidden",
      (!this.isMenuOpen).toString()
    );

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? "hidden" : "";
  }

  cleanup() {
    // Remove event listeners to prevent memory leaks
    this.elements.menuTrigger?.removeEventListener(
      "click",
      this.handleMenuOpen
    );
    this.elements.menuClose?.removeEventListener("click", this.handleMenuClose);
    this.elements.overlay?.removeEventListener("click", this.handleMenuClose);
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

/**
 * Initialize header component
 */
export function initHeader(container) {
  return new HeaderManager(container);
}

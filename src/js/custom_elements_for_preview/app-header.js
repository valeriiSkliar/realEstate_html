export class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <!-- Header Component -->
<header class="header">
  <div class="header__logo">
    <a href="/">
      <img src="./images/logo.svg" alt="Real Estate" />
    </a>
  </div>
  <div class="header__actions">
    <a href="/support.html" class="header__action-btn" aria-label="Messages">
      <i class="bi bi-chat text-brand-turquoise"> </i>
    </a>
            <a
          href="/collections.html"
          class="header__action-btn"
          aria-label="Collections"
        >
          <i class="bi bi-collection text-brand-turquoise"></i>
        </a>
    <a href="/favorites.html" class="header__action-btn" aria-label="Favorites">
      <i class="bi bi-heart text-brand-turquoise"></i>
    </a>
    <a href="/search.html" class="header__action-btn" aria-label="Search">
      <i class="bi bi-search text-brand-turquoise"></i>
    </a>
    <button class="header__action-btn js-menu-trigger" aria-label="Menu">
      <i class="bi bi-list text-brand-dark-navy"></i>
    </button>
  </div>
</header>

<!-- Overlay for mobile menu -->
<div class="overlay js-overlay"></div>

      `;
  }
}

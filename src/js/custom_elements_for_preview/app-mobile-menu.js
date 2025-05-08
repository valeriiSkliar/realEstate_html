export class AppMobileMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <!-- Mobile Menu -->
      <nav class="mobile-menu">
        <div class="mobile-menu__header">
          <button class="mobile-menu__close js-menu-close" aria-label="Close menu">
            <i class="bi bi-x-lg text-brand-dark-navy"></i>
          </button>
          <div class="header__logo">
            <img src="./images/logo.svg" alt="Real Estate" />
          </div>
        </div>
        <ul class="mobile-menu__list">
          <li class="mobile-menu__item">
            <a href="/" class="mobile-menu__link">
              <i class="bi bi-house text-brand-turquoise"></i>
              <span class="text-brand-dark-navy">Главная</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/search" class="mobile-menu__link">
              <i class="bi bi-search text-brand-turquoise"></i>
              <span class="text-brand-dark-navy">Поиск недвижимости</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/my-advertisements.html" class="mobile-menu__link">
              <i class="bi bi-building text-brand-turquoise"></i>
              <span class="text-brand-dark-navy">Мои объявления</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/collections.html" class="mobile-menu__link">
              <i class="bi bi-collection text-brand-turquoise"></i>
              <span class="text-brand-dark-navy">Мои подборки</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/favorites.html" class="mobile-menu__link">
              <i class="bi bi-heart text-brand-turquoise"></i>
              <span class="text-brand-dark-navy">Избранное</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/profile.html" class="mobile-menu__link">
              <i class="bi bi-person text-brand-turquoise"></i>
              <span class="text-brand-dark-navy">Профиль</span>
            </a>
          </li>
          <li class="mobile-menu__item">
            <a href="/support.html" class="mobile-menu__link">
              <i class="bi bi-question-circle text-brand-turquoise"></i>
              <span class="text-brand-dark-navy">Поддержка</span>
            </a>
          </li>
        </ul>
      </nav>
    `;
  }
}

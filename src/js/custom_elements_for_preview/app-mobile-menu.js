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
            <img src="./images/logo_with_text.svg" alt="Real Estate" />
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
          <li class="mobile-menu__item">
            <a href="/collections.html" class="mobile-menu__link">
              <span class="text-light-gray-30">Мои подборки</span>
            </a>
          </li>
          <li class="mobile-menu__item"></li>
        </ul>
        
        <div class="mobile-menu__app-description">
          <p class="text-end">
            <span class="text-brand-turquoise fw-bold">GoAnyTime</span> — приложение, которое делает простым и удобным поиск объектов недвижимости
          </p>
        </div>
      </nav>
    `;

    // Add event listener for close button
    this.querySelector(".js-menu-close").addEventListener("click", () => {
      document.querySelector(".mobile-menu").classList.remove("is-active");
      document.querySelector(".overlay").classList.remove("is-active");
    });
  }
}

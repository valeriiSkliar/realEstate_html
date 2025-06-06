export class PropertySummaryCard extends HTMLElement {
  constructor() {
    super();
    // Убираем Shadow DOM
    this.rendered = false;
    this.isToggling = false; // Флаг для предотвращения множественных кликов
    this.boundToggleFavorite = null;
    this.boundKeydownHandler = null;
  }

  static get observedAttributes() {
    return [
      "title-text",
      "title-href",
      "price-text",
      "details-json",
      "is-favorite",
      "phone-number",
      "agent-name",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      // Only re-render if it's not the favorite attribute being changed
      // or if the component hasn't been rendered yet
      if (name !== "is-favorite" || !this.rendered) {
        this.render();
      } else if (name === "is-favorite") {
        // Just update the favorite icon without full re-render
        this.updateFavoriteIcon(newValue === "true");
      }
    }
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    
    // Styles for collection selector popup are now globally managed via SCSS.
  }

  setupEventListeners() {
    const favoriteIcon = this.querySelector(
      ".property-summary-card__favorite-icon"
    );
    if (favoriteIcon) {
      // Удаляем старые обработчики перед добавлением новых
      favoriteIcon.removeEventListener("click", this.boundToggleFavorite);
      favoriteIcon.removeEventListener("keydown", this.boundKeydownHandler);

      // Создаем bound функции для возможности их удаления
      this.boundToggleFavorite = this.toggleFavorite.bind(this);
      this.boundKeydownHandler = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.toggleFavorite(event);
        }
      };

      favoriteIcon.addEventListener("click", this.boundToggleFavorite);
      favoriteIcon.addEventListener("keydown", this.boundKeydownHandler);
    }
  }

  toggleFavorite(event) {
    // Предотвращаем всплытие события и множественные вызовы
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    // Добавляем защиту от множественных быстрых кликов
    if (this.isToggling) {
      return;
    }
    this.isToggling = true;

    const currentState = this.getAttribute("is-favorite") === "true";
    const newState = !currentState;

    // Находим иконку избранного
    const favoriteIcon = this.querySelector(
      ".property-summary-card__favorite-icon"
    );

    if (!favoriteIcon) {
      this.isToggling = false;
      return;
    }

    // Добавляем класс анимации только к кнопке
    favoriteIcon.classList.add("property-summary-card__favorite-icon--animate");

    // Убираем класс анимации через время анимации
    setTimeout(() => {
      favoriteIcon.classList.remove(
        "property-summary-card__favorite-icon--animate"
      );
      this.isToggling = false; // Разрешаем следующий клик после анимации
    }, 300);

    // Обновляем атрибут (это НЕ будет вызывать полный re-render благодаря логике в attributeChangedCallback)
    this.setAttribute("is-favorite", newState.toString());

    // Создаем кастомное событие для уведомления родительского элемента
    this.dispatchEvent(
      new CustomEvent("favorite-changed", {
        detail: {
          isFavorite: newState,
          element: this,
          propertyId: this.getAttribute('property-id') || `property_${Date.now()}`,
          propertyTitle: this.getAttribute('title-text') || 'Объект недвижимости'
        },
        bubbles: true,
      })
    );
  }

  // Новый метод для обновления только иконки избранного
  updateFavoriteIcon(isFavorite) {
    const favoriteIcon = this.querySelector(
      ".property-summary-card__favorite-icon"
    );

    if (!favoriteIcon) return;

    // SVG иконки сердечка
    const heartIconEmpty = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-bright-pink)" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    const heartIconFilled = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--brand-bright-pink)" stroke="var(--brand-bright-pink)" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    // Обновляем иконку
    favoriteIcon.innerHTML = isFavorite ? heartIconFilled : heartIconEmpty;

    // Обновляем CSS класс
    if (isFavorite) {
      favoriteIcon.classList.add(
        "property-summary-card__favorite-icon--active"
      );
    } else {
      favoriteIcon.classList.remove(
        "property-summary-card__favorite-icon--active"
      );
    }

    // Обновляем aria-label для доступности
    favoriteIcon.setAttribute(
      "aria-label",
      isFavorite ? "Удалить из избранного" : "Добавить в избранное"
    );
  }

  render() {
    const titleText = this.getAttribute("title-text") || "N/A";
    const titleHref = this.getAttribute("title-href") || "#";
    const priceText = this.getAttribute("price-text") || "N/A";
    const detailsJson = this.getAttribute("details-json") || "[]";
    const isFavorite = this.getAttribute("is-favorite") === "true";
    const phoneNumber = this.getAttribute("phone-number") || "";
    const agentName = this.getAttribute("agent-name") || "";
    let details = [];
    try {
      details = JSON.parse(detailsJson);
    } catch (e) {
      console.error("Error parsing details-json attribute:", e);
      details = [{ label: "Error", value: "Invalid details data" }];
    }

    // SVG иконки сердечка
    const heartIconEmpty = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-bright-pink)" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    const heartIconFilled = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--brand-bright-pink)" stroke="var(--brand-bright-pink)" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    // Создаем CSS стили если их еще нет в документе
    if (!document.querySelector("#property-summary-card-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "property-summary-card-styles";
      styleElement.textContent = `
        property-summary-card {
          display: block;
          font-family: var(--property-card-font-family, Roboto, sans-serif);
          /* Define CSS custom properties for theming, with fallbacks */
          --brand-dark-navy: var(--brand-dark-navy, #252736);
          --brand-turquoise: var(--brand-turquoise, #00c9dd);
          --brand-dark-navy-80: var(--brand-dark-navy-80, rgba(37, 39, 54, 0.8));
          --card-padding: var(--card-padding, 15px);
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Очищаем старые обработчики перед рендерингом
    if (this.rendered) {
      const oldFavoriteIcon = this.querySelector(
        ".property-summary-card__favorite-icon"
      );
      if (oldFavoriteIcon && this.boundToggleFavorite) {
        oldFavoriteIcon.removeEventListener("click", this.boundToggleFavorite);
        oldFavoriteIcon.removeEventListener(
          "keydown",
          this.boundKeydownHandler
        );
      }
    }

    this.innerHTML = `
            <div class="property-summary-card">
                <div class="property-summary-card__favorite-icon ${
                  isFavorite
                    ? "property-summary-card__favorite-icon--active"
                    : ""
                }" 
                     role="button" 
                     aria-label="${
                       isFavorite
                         ? "Удалить из избранного"
                         : "Добавить в избранное"
                     }"
                     tabindex="0">
                    ${isFavorite ? heartIconFilled : heartIconEmpty}
                </div>
                
                <h3 class="property-summary-card__title text-light-gray-30">
                    <a href="${titleHref}">${titleText}</a>
                </h3>
                <p class="property-summary-card__price">${priceText}</p>
                <ul class="property-summary-card__details-list">
                    ${details
                      .map(
                        (detail) => `
                        <li class="property-summary-card__detail-item">
                            <span class="property-summary-card__detail-label">${detail.label}</span>
                            <span class="property-summary-card__detail-value">${detail.value}</span>
                        </li>
                    `
                      )
                      .join("")}
                </ul>
                ${
                  phoneNumber
                    ? `
                    <div class="property-summary-card__phone">
                    <span class="property-summary-card__phone-label">Агент:</span>
                        ${
                          agentName
                            ? `<span class="property-summary-card__phone-agent-name">${agentName}</span>`
                            : ""
                        }
                        <a href="tel:${phoneNumber}" class="property-summary-card__phone-link">
                            📞 ${phoneNumber}
                        </a>
                    </div>
                `
                    : ""
                }
            </div>
        `;

    this.rendered = true;

    // Переустанавливаем обработчики событий после рендеринга
    this.setupEventListeners();
  }
}

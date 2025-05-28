export class PropertySummaryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
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
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const favoriteIcon = this.shadowRoot.querySelector(
      ".property-summary-card__favorite-icon"
    );
    if (favoriteIcon) {
      favoriteIcon.addEventListener("click", this.toggleFavorite.bind(this));

      // Добавляем поддержку клавиатуры для доступности
      favoriteIcon.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.toggleFavorite();
        }
      });
    }
  }

  toggleFavorite() {
    const currentState = this.getAttribute("is-favorite") === "true";
    const newState = !currentState;

    // Находим иконку избранного
    const favoriteIcon = this.shadowRoot.querySelector(
      ".property-summary-card__favorite-icon"
    );

    // Добавляем класс анимации только к кнопке
    favoriteIcon.classList.add("property-summary-card__favorite-icon--animate");

    // Убираем класс анимации через время анимации
    setTimeout(() => {
      favoriteIcon.classList.remove(
        "property-summary-card__favorite-icon--animate"
      );
    }, 300);

    // Обновляем атрибут
    this.setAttribute("is-favorite", newState.toString());

    // Создаем кастомное событие для уведомления родительского элемента
    this.dispatchEvent(
      new CustomEvent("favorite-changed", {
        detail: {
          isFavorite: newState,
          element: this,
        },
        bubbles: true,
      })
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

    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="css/propertyCard.css">
            <style>
                :host {
                    display: block;
                    font-family: var(--property-card-font-family, Roboto, sans-serif);
                    /* Define CSS custom properties for theming, with fallbacks */
                    --brand-dark-navy: ${this.getCSSVariableValue(
                      "--brand-dark-navy",
                      "#252736"
                    )};
                    --brand-turquoise: ${this.getCSSVariableValue(
                      "--brand-turquoise",
                      "#00c9dd"
                    )};
                    --brand-dark-navy-80: ${this.getCSSVariableValue(
                      "--brand-dark-navy-80",
                      "rgba(37, 39, 54, 0.8)"
                    )};
                    --card-padding: ${this.getCSSVariableValue(
                      "--card-padding",
                      "15px"
                    )};
                }
            </style>
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

    // Переустанавливаем обработчики событий после рендеринга
    this.setupEventListeners();
  }

  // Helper to allow overriding CSS variables from outside the component via adoptedStyleSheets or parent styles
  getCSSVariableValue(varName, defaultValue) {
    // This is a simplified way; for complex scenarios, you might need more robust detection
    // or rely on CSS variable inheritance into the shadow DOM.
    // For now, we'll just allow direct fallback if not defined by :host styles.
    return `var(${varName}, ${defaultValue})`;
  }
}

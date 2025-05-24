class MyPropertyCard extends HTMLElement {
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
      "status",
      "actions-position",
      "show-actions",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const titleText = this.getAttribute("title-text") || "N/A";
    const titleHref = this.getAttribute("title-href") || "#";
    const priceText = this.getAttribute("price-text") || "N/A";
    const detailsJson = this.getAttribute("details-json") || "[]";
    const phoneNumber = this.getAttribute("phone-number") || "";
    const status = this.getAttribute("status") || "Активно";
    const actionsPosition = this.getAttribute("actions-position") || "right"; // "left" или "right"
    const showActions = this.getAttribute("show-actions") === "true";

    let details = [];
    try {
      details = JSON.parse(detailsJson);
    } catch (e) {
      console.error("Error parsing details-json attribute:", e);
      details = [{ label: "Error", value: "Invalid details data" }];
    }

    // Получаем информацию о статусе
    const getStatusInfo = (status) => {
      switch (status.toLowerCase()) {
        case "активно":
          return {
            text: status,
            class: "property-summary-card__status-badge--active",
          };
        case "в архив":
        case "в архиве":
          return {
            text: status,
            class: "property-summary-card__status-badge--archived",
          };
        case "черновик":
          return {
            text: status,
            class: "property-summary-card__status-badge--draft",
          };
        default:
          return {
            text: status,
            class: "property-summary-card__status-badge--active",
          };
      }
    };

    // Получаем действия для статуса
    const getActionsForStatus = (status) => {
      switch (status.toLowerCase()) {
        case "активно":
          return ["edit", "archive", "delete"];
        case "в архив":
        case "в архиве":
          return ["restore", "delete"];
        case "черновик":
          return ["edit", "restore", "delete"];
        default:
          return ["edit", "archive", "delete"];
      }
    };

    // SVG иконки для действий
    const getActionIcon = (action) => {
      const icons = {
        edit: `<svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
        </svg>`,
        archive: `<svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
        </svg>`,
        delete: `<svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>`,
        restore: `<svg viewBox="0 0 16 16" fill="currentColor">
          <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>`,
        activate: `<svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>`,
      };
      return icons[action] || "";
    };

    // Получаем название действия для aria-label
    const getActionLabel = (action) => {
      const labels = {
        edit: "Редактировать",
        archive: "В архив",
        delete: "Удалить",
        restore: "Восстановить",
        activate: "Активировать",
      };
      return labels[action] || action;
    };

    const statusInfo = getStatusInfo(status);
    const actions = showActions ? getActionsForStatus(status) : [];

    // Определяем класс футера в зависимости от наличия действий и их позиции
    let footerClass = "property-summary-card__footer";
    if (showActions && actionsPosition === "right") {
      footerClass += " property-summary-card__footer--actions-right";
    } else if (!showActions) {
      footerClass += " property-summary-card__footer--status-right";
    }

    this.shadowRoot.innerHTML = `
     <link rel="stylesheet" href="css/propertyCard.css">
                <div class="property-summary-card">
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
                            <a href="tel:${phoneNumber}" class="property-summary-card__phone-link">
                                📞 ${phoneNumber}
                            </a>
                        </div>
                    `
                        : ""
                    }
                    <div class="${footerClass}">
                        ${
                          actionsPosition === "left" && showActions
                            ? `
                            <div class="property-summary-card__actions">
                                ${actions
                                  .map(
                                    (action) => `
                                    <button 
                                        class="property-summary-card__action-btn property-summary-card__action-btn--${action}"
                                        data-action="${action}"
                                        aria-label="${getActionLabel(action)}"
                                        title="${getActionLabel(action)}"
                                    >
                                        ${getActionIcon(action)}
                                    </button>
                                `
                                  )
                                  .join("")}
                            </div>
                        `
                            : ""
                        }
                        
                        <span class="property-summary-card__status-badge ${
                          statusInfo.class
                        }">
                            ${statusInfo.text}
                        </span>
                        
                        ${
                          actionsPosition === "right" && showActions
                            ? `
                            <div class="property-summary-card__actions">
                                ${actions
                                  .map(
                                    (action) => `
                                    <button 
                                        class="property-summary-card__action-btn property-summary-card__action-btn--${action}"
                                        data-action="${action}"
                                        aria-label="${getActionLabel(action)}"
                                        title="${getActionLabel(action)}"
                                    >
                                        ${getActionIcon(action)}
                                    </button>
                                `
                                  )
                                  .join("")}
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;

    // Добавляем обработчики событий для действий
    if (showActions) {
      this.setupActionListeners();
    }
  }

  setupActionListeners() {
    const actionButtons = this.shadowRoot.querySelectorAll(
      ".property-summary-card__action-btn"
    );
    actionButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const action = event.currentTarget.dataset.action;
        this.handleAction(action);
      });
    });
  }

  handleAction(action) {
    // Создаем кастомное событие для родительского элемента
    this.dispatchEvent(
      new CustomEvent("action-triggered", {
        detail: {
          action,
          element: this,
          status: this.getAttribute("status"),
        },
        bubbles: true,
      })
    );
  }
}

customElements.define("my-property-card", MyPropertyCard);

class MyPropertyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["title-text", "title-href", "price-text", "details-json", "status"];
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

    const statusInfo = getStatusInfo(status);

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
                  <div class="property-summary-card__footer">
                      <span class="property-summary-card__status-badge ${
                        statusInfo.class
                      }">
                          ${statusInfo.text}
                      </span>
                  </div>
              </div>
          `;
  }
}

customElements.define("my-property-card", MyPropertyCard);

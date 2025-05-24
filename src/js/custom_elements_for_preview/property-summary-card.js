// src/js/components/property-summary-card.js
class PropertySummaryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["title-text", "title-href", "price-text", "details-json"];
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

    let details = [];
    try {
      details = JSON.parse(detailsJson);
    } catch (e) {
      console.error("Error parsing details-json attribute:", e);
      details = [{ label: "Error", value: "Invalid details data" }];
    }

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
            </div>
        `;
  }

  // Helper to allow overriding CSS variables from outside the component via adoptedStyleSheets or parent styles
  getCSSVariableValue(varName, defaultValue) {
    // This is a simplified way; for complex scenarios, you might need more robust detection
    // or rely on CSS variable inheritance into the shadow DOM.
    // For now, we'll just allow direct fallback if not defined by :host styles.
    return `var(${varName}, ${defaultValue})`;
  }
}

customElements.define("property-summary-card", PropertySummaryCard);

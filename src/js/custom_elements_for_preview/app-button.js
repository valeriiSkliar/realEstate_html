export class AppButton extends HTMLElement {
  static get observedAttributes() {
    return ["variant", "href", "icon"];
  }

  constructor() {
    super();
    this._variant = "solid";
    this._href = null;
    this._icon = null;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[`_${name}`] = newValue;
      this.render();
    }
  }

  render() {
    const content = this.textContent || "Добавить объявление";
    const buttonClass = `brand-button brand-button--${
      this._variant || "solid"
    }`;
    const iconHtml = this._icon
      ? `<i class="bi bi-${this._icon} me-2"></i>`
      : "";

    if (this._href) {
      this.innerHTML = `
        <a href="${this._href}" class="${buttonClass}">
          ${iconHtml}${content}
        </a>
      `;
    } else {
      this.innerHTML = `
        <button class="${buttonClass}">
          ${iconHtml}${content}
        </button>
      `;
    }
  }
}

// Register the custom element
customElements.define("app-button", AppButton);

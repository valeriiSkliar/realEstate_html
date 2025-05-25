export class BrandButton extends HTMLElement {
  static get observedAttributes() {
    return ["variant", "href", "icon", "disabled", "type", "color"];
  }

  constructor() {
    super();
    this._variant = "solid";
    this._href = null;
    this._icon = null;
    this._disabled = false;
    this._type = "button";
    this._color = "green"; // default color
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === "disabled") {
        this._disabled = newValue !== null;
      } else {
        this[`_${name}`] = newValue;
      }
      this.render();
    }
  }

  get variant() {
    return this._variant;
  }

  set variant(value) {
    if (value !== this._variant) {
      this._variant = value;
      this.setAttribute("variant", value);
    }
  }

  get href() {
    return this._href;
  }

  set href(value) {
    if (value !== this._href) {
      this._href = value;
      if (value) {
        this.setAttribute("href", value);
      } else {
        this.removeAttribute("href");
      }
    }
  }

  get icon() {
    return this._icon;
  }

  set icon(value) {
    if (value !== this._icon) {
      this._icon = value;
      if (value) {
        this.setAttribute("icon", value);
      } else {
        this.removeAttribute("icon");
      }
    }
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    const isDisabled = Boolean(value);
    if (isDisabled !== this._disabled) {
      this._disabled = isDisabled;
      if (isDisabled) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
  }

  get type() {
    return this._type;
  }

  set type(value) {
    if (value !== this._type) {
      this._type = value;
      this.setAttribute("type", value);
    }
  }

  get color() {
    return this._color;
  }

  set color(value) {
    if (value !== this._color) {
      this._color = value;
      this.setAttribute("color", value);
    }
  }

  render() {
    const content = this.textContent?.trim() || "Добавить объявление";
    const variant = this._variant || "solid";
    const color = this._color || "green";

    // Формируем классы для кнопки
    let buttonClass = `brand-button brand-button--${variant}`;
    if (color !== "green") {
      buttonClass += ` brand-button--${color}`;
    }

    // Создаем HTML для иконки
    const iconHtml = this._icon
      ? `<i class="bi bi-${this._icon}" style="margin-right: 0.5em;"></i>`
      : "";

    // Если есть href, создаем ссылку
    if (this._href && !this._disabled) {
      this.innerHTML = `
        <a href="${this._href}" class="${buttonClass}">
          ${iconHtml}${content}
        </a>
      `;
    } else {
      // Создаем кнопку
      const disabledAttr = this._disabled ? "disabled" : "";
      const typeAttr = this._type ? `type="${this._type}"` : 'type="button"';

      this.innerHTML = `
        <button class="${buttonClass}" ${disabledAttr} ${typeAttr}>
          ${iconHtml}${content}
        </button>
      `;

      // Добавляем стили для disabled состояния
      if (this._disabled) {
        const button = this.querySelector("button");
        if (button) {
          button.style.opacity = "0.6";
          button.style.cursor = "not-allowed";
          button.style.pointerEvents = "none";
        }
      }
    }

    // Добавляем обработчики событий
    this.setupEventListeners();
  }

  setupEventListeners() {
    const element = this.querySelector("button, a");
    if (element && !this._disabled) {
      // Убираем старые обработчики
      element.replaceWith(element.cloneNode(true));
      const newElement = this.querySelector("button, a");

      newElement.addEventListener("click", (e) => {
        if (this._disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Диспатчим кастомное событие
        this.dispatchEvent(
          new CustomEvent("brand-button-click", {
            detail: {
              variant: this._variant,
              color: this._color,
              href: this._href,
              icon: this._icon,
              text: this.textContent?.trim(),
            },
            bubbles: true,
          })
        );
      });
    }
  }

  // Методы для программного управления
  click() {
    if (!this._disabled) {
      const element = this.querySelector("button, a");
      element?.click();
    }
  }

  focus() {
    const element = this.querySelector("button, a");
    element?.focus();
  }

  blur() {
    const element = this.querySelector("button, a");
    element?.blur();
  }
}

// Register the custom element
customElements.define("brand-button", BrandButton);

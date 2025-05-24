class CustomBreadcrumb extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["separator", "theme", "class"];
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  get separator() {
    return this.getAttribute("separator") || "/";
  }

  get theme() {
    return this.getAttribute("theme") || "light";
  }

  get customClasses() {
    return this.getAttribute("class") || "";
  }

  setupEventListeners() {
    this.addEventListener("click", (e) => {
      if (
        e.target.tagName === "BREADCRUMB-ITEM" &&
        e.target.hasAttribute("href")
      ) {
        const href = e.target.getAttribute("href");
        if (href && !e.defaultPrevented) {
          window.location.href = href;
        }
      }
    });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const items = Array.from(this.querySelectorAll("breadcrumb-item"));
    const classes = this.customClasses
      .split(" ")
      .map((className) => className.trim())
      .filter(Boolean);

    this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/css/breadcrumbs.css"> 
            <style>
                .breadcrumb-item:not(:last-child)::after {
                    content: "${this.separator}";
                }
            </style>
            <nav class="breadcrumb ${classes.join(
              " "
            )}" aria-label="Breadcrumb navigation" role="navigation">
                <ul class="breadcrumb-list">
                    ${items
                      .map((item, index) => this.renderItem(item, index + 1))
                      .join("")}
                </ul>
            </nav>
        `;

    // Передаем классы из атрибута в Shadow DOM
    const navElement = this.shadowRoot.querySelector("nav");
    classes.forEach((className) => {
      navElement.classList.add(className);
    });
  }

  renderItem(item, position) {
    const text = item.textContent.trim();
    const href = item.getAttribute("href");
    const isActive = item.hasAttribute("active");
    const itemClasses = item.getAttribute("class") || "";

    if (isActive) {
      return `
                <li class="breadcrumb-item ${itemClasses}">
                    <span class="breadcrumb-active">${text}</span>
                </li>
            `;
    } else {
      return `
                <li class="breadcrumb-item ${itemClasses}">
                    <a class="breadcrumb-link" 
                       ${href ? `href="${href}"` : ""}>
                        ${text}
                    </a>
                </li>
            `;
    }
  }
}

class BreadcrumbItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.style.display = "none";
    const parent = this.closest("custom-breadcrumb");
    if (parent) {
      parent.render();
    }
  }

  static get observedAttributes() {
    return ["href", "active", "class"];
  }

  attributeChangedCallback() {
    const parent = this.closest("custom-breadcrumb");
    if (parent && parent.shadowRoot) {
      parent.render();
    }
  }
}

customElements.define("custom-breadcrumb", CustomBreadcrumb);
customElements.define("breadcrumb-item", BreadcrumbItem);

class CustomBreadcrumb extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  static get observedAttributes() {
    return ["separator", "theme", "class"]; // Keep observing these
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Re-render if observed attributes change
    if (this.shadowRoot) {
      this.render();
    }
  }

  get separator() {
    // Kept for potential future use or if JS-driven separator is still desired
    return this.getAttribute("separator") || "▸"; // Defaulting to new separator
  }

  get theme() {
    return this.getAttribute("theme") || "light";
  }

  get customClasses() {
    return this.getAttribute("class") || "";
  }

  setupEventListeners() {
    // Event listener for navigation (original logic seems fine)
    this.shadowRoot.addEventListener("click", (e) => {
      const breadcrumbLink = e.target.closest(".breadcrumb-link");
      if (breadcrumbLink && breadcrumbLink.hasAttribute("href")) {
        const href = breadcrumbLink.getAttribute("href");
        if (href && href !== "#" && !e.defaultPrevented) {
          // Check if it's not just a placeholder href
          window.location.href = href;
        }
      }
    });
  }

  render() {
    const items = Array.from(this.querySelectorAll("breadcrumb-item"));
    const hostClasses = this.customClasses
      .split(" ")
      .map((className) => className.trim())
      .filter(Boolean);

    this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/css/breadcrumbs.css">
            <style>
              /* Minimal inline styles, if any are truly dynamic and component-specific. */
              /* Example: if separator was still fully dynamic via attribute: */
              /*
              :host([separator]) .breadcrumb-item:not(:last-child)::after {
                  content: "${this.separator}";
              }
              */
            </style>
            <nav class="breadcrumb ${hostClasses.join(
              " "
            )}" aria-label="Breadcrumb navigation" role="navigation">
                <ol class="breadcrumb-list">
                    ${items.map((item) => this.renderItem(item)).join("")}
                </ol>
            </nav>
        `;
  }

  renderItem(item) {
    const text = item.textContent.trim();
    const href = item.getAttribute("href");
    // 'active' attribute for the current page item (typically yellow background)
    const isActivePage = item.hasAttribute("active");
    // 'highlight' attribute for other special highlights (e.g., "turquoise", "yellow" for non-active)
    const highlightType = item.getAttribute("highlight");
    const itemSpecificClasses = item.getAttribute("class") || "";

    let liClasses = "breadcrumb-item";
    if (itemSpecificClasses) {
      liClasses += ` ${itemSpecificClasses}`;
    }

    // Add classes based on attributes for specific styling
    if (isActivePage) {
      liClasses += " active-page"; // For yellow background on the current/last item
    } else if (highlightType === "turquoise") {
      liClasses += " highlight-turquoise";
    } else if (highlightType === "yellow") {
      liClasses += " highlight-yellow";
    }
    // Extend with more else if (highlightType === 'other-color') for other highlights

    if (href && !isActivePage) {
      // Active page is usually not a link
      return `
                <li class="${liClasses}">
                    <a class="breadcrumb-link" href="${href}">${text}</a>
                </li>
            `;
    } else {
      // For non-link items (like the very last active item)
      return `
                <li class="${liClasses}">
                    <span class="breadcrumb-text">${text}</span>
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
    this.style.display = "none"; // Items are rendered by parent
    const parent = this.closest("custom-breadcrumb");
    if (parent && parent.shadowRoot) {
      // Ensure shadowRoot exists before calling render
      parent.render();
    }
  }

  static get observedAttributes() {
    return ["href", "active", "highlight", "class"]; // Added "highlight"
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const parent = this.closest("custom-breadcrumb");
    if (parent && parent.shadowRoot) {
      parent.render();
    }
  }
}

customElements.define("custom-breadcrumb", CustomBreadcrumb);
customElements.define("breadcrumb-item", BreadcrumbItem);

export class AppEmptyState extends HTMLElement {
  static get observedAttributes() {
    return [
      "icon",
      "title",
      "description",
      "button-text",
      "button-href",
      "button-class",
    ];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const icon = this.getAttribute("icon") || "bi-collection";
    const title = this.getAttribute("title") || "No items yet";
    const description = this.getAttribute("description") || "";
    const buttonText = this.getAttribute("button-text") || "Create";
    const buttonHref = this.getAttribute("button-href") || "#";
    const buttonClass =
      this.getAttribute("button-class") ||
      "btn-brand-turquoise text-brand-light-gray";

    this.innerHTML = `
      <div class="collections-empty-state js-empty-collections" style="display: none">
        <div class="empty-state-icon">
          <i class="bi ${icon}"></i>
        </div>
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-description">
          ${description}
        </p>
        <a href="${buttonHref}" class="btn ${buttonClass}">
          ${buttonText}
        </a>
      </div>
    `;
  }
}

class PropertyListComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        .property-card-list {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          padding: 10px 0;
        }
      </style>
      <div class="property-card-list">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("property-list-component", PropertyListComponent);

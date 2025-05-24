class PropertyListComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // The external stylesheet for this component's specific layout.
    // This should point to the compiled CSS from `_property-card-list.scss`.
    // For example, if Webpack compiles it to `public/css/property-card-list.css`.
    // The path needs to be relative to where the component is used or an absolute path.
    //
    // For this example, I'm embedding a simplified version directly.
    // In a real setup, you'd likely use a <link> tag if styles are substantial
    // or if your bundler (like Webpack) handles CSS-in-JS or style injection.

    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="/css/propertyCardList.css">
            <div class="property-card-list-container">
                <slot></slot> 
            </div>
        `;
  }
}

customElements.define("property-list-component", PropertyListComponent);

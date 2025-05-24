// src/js/components/property-list-component.js

// We need to compile _property-card-list.scss to CSS first.
// For this example, I'll create a simplified CSS string for list layout.
// In a real build process, Webpack would handle SCSS compilation.
const listComponentStyles = `
  :host {
    display: block;
    --list-gap: var(--property-list-gap, 20px);
    --list-item-min-width: var(--property-list-item-min-width, 300px);
    font-family: var(--property-list-font-family, Roboto, sans-serif);
  }
  .property-card-list-container {
    display: grid;
    gap: var(--list-gap);
    grid-template-columns: repeat(auto-fill, minmax(var(--list-item-min-width), 1fr));
    padding: 10px 0;
  }

  /* Placeholder style if you want to style the slot itself */
  ::slotted(property-summary-card) {
    /* You can add styles here that affect the slotted custom elements directly from the host,
       but generally, the card should style itself.
       This could be useful for margins or other layout hints if needed. */
    // Example: border: 1px dashed #ccc;
  }
`;

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
            <style>
                ${listComponentStyles}
            </style>
            <div class="property-card-list-container">
                <slot></slot> 
            </div>
        `;
  }
}

customElements.define("property-list-component", PropertyListComponent);

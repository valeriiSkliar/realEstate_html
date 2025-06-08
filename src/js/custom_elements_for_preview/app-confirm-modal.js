export class AppConfirmModal extends HTMLElement {
  static get observedAttributes() {
    return [
      "modal-id",
      "title",
      "message",
      "cancel-text",
      "confirm-text",
      "confirm-class",
    ];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const modalId = this.getAttribute("modal-id") || "confirmModal";
    const title = this.getAttribute("title") || "Confirm";
    const message = this.getAttribute("message") || "Are you sure?";
    const cancelText = this.getAttribute("cancel-text") || "Cancel";
    const confirmText = this.getAttribute("confirm-text") || "Confirm";
    const confirmClass =
      this.getAttribute("confirm-class") || "btn-brand-bright-pink";

    this.innerHTML = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}Label">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>${message}</p>
              <slot name="modal-content"></slot>
            </div>
            <div class="modal-footer">
              <button type="button" class="brand-button brand-button--outline brand-button--turquoise" data-bs-dismiss="modal">
                ${cancelText}
              </button>
              <button type="button" class="brand-button brand-button--solid brand-button--pink js-confirm-action">
                ${confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

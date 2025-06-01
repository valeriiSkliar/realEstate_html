// src/js/custom_elements_for_preview/my-advertisement-card.js
const brandColors = {
  limeGreen: "var(--brand-lime-green)",
  darkNavy: "var(--brand-dark-navy)",
  turquoise: "var(--brand-turquoise)",
  brightPink: "var(--brand-bright-pink)",
  lightGray: "var(--brand-light-gray)",
  darkNavy50: "var(--brand-dark-navy-50)",
  darkNavy80: "var(--brand-dark-navy-80)",
};

export class MyAdvertisementCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [
      "listing-id",
      "title-text",
      "location-text",
      "price-text",
      "date-text",
      "views-text",
      "favorites-text",
      "status", // 'active', 'archived', 'draft'
      "details-json", // e.g., '[{"label":"Тип", "value":"Квартира"}, {"label":"Площадь", "value":"85 м²"}]'
      "image-src",
    ];
  }

  connectedCallback() {
    this.render();
    this._attachEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this._attachEventListeners(); // Re-attach if card re-renders
    }
  }

  _getStatusInfo(status) {
    switch (status) {
      case "active":
        return { text: "Активно", class: "status-badge--active" };
      case "archived":
        return { text: "В архиве", class: "status-badge--archived" };
      case "draft":
        return { text: "Черновик", class: "status-badge--draft" };
      default:
        return { text: "Неизвестно", class: "status-badge--unknown" };
    }
  }

  _getActionButtons(status) {
    const listingId = this.getAttribute("listing-id") || "unknown";
    let buttons = "";
    if (status === "active") {
      buttons = `
          <button class="action-btn" title="Редактировать" data-action="edit" data-id="${listingId}"><i class="bi bi-pencil"></i></button>
          <button class="action-btn" title="В архив" data-action="archive" data-id="${listingId}"><i class="bi bi-archive"></i></button>
          <button class="action-btn action-btn--delete" title="Удалить" data-action="delete" data-id="${listingId}"><i class="bi bi-trash"></i></button>
        `;
    } else if (status === "archived") {
      buttons = `
          <button class="action-btn" title="Восстановить" data-action="restore" data-id="${listingId}"><i class="bi bi-arrow-up-circle"></i></button>
          <button class="action-btn action-btn--delete" title="Удалить" data-action="delete" data-id="${listingId}"><i class="bi bi-trash"></i></button>
        `;
    } else if (status === "draft") {
      buttons = `
          <button class="action-btn" title="Редактировать" data-action="edit" data-id="${listingId}"><i class="bi bi-pencil"></i></button>
          <button class="action-btn" title="Активировать" data-action="activate" data-id="${listingId}"><i class="bi bi-check-circle"></i></button>
          <button class="action-btn action-btn--delete" title="Удалить" data-action="delete" data-id="${listingId}"><i class="bi bi-trash"></i></button>
        `;
    }
    return `<div class="listing-item__controls">${buttons}</div>`;
  }

  _getDetailsHtml() {
    const detailsJson = this.getAttribute("details-json") || "[]";
    let details = [];
    try {
      details = JSON.parse(detailsJson);
    } catch (e) {
      console.error("Error parsing details-json for my-advertisement-card:", e);
      return '<p class="details-error">Ошибка в данных</p>';
    }

    if (!Array.isArray(details) || details.length === 0) {
      return ""; // No details to show
    }

    return `
        <ul class="details-list">
          ${details
            .map(
              (detail) => `
            <li class="detail-item">
              <span class="detail-label">${detail.label}:</span>
              <span class="detail-value">${detail.value}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      `;
  }

  render() {
    const titleText = this.getAttribute("title-text") || "Без названия";
    const locationText =
      this.getAttribute("location-text") || "Местоположение не указано";
    const priceText = this.getAttribute("price-text") || "Цена не указана";
    const dateText = this.getAttribute("date-text");
    const viewsText = this.getAttribute("views-text");
    const favoritesText = this.getAttribute("favorites-text");
    const status = this.getAttribute("status") || "unknown";
    const imageSrc = this.getAttribute("image-src");

    const statusInfo = this._getStatusInfo(status);
    const actionButtonsHtml = this._getActionButtons(status);
    const detailsHtml = this._getDetailsHtml();

    // Conditionally render image wrapper only if imageSrc is valid
    const imageHtml =
      imageSrc && imageSrc.trim() !== ""
        ? `
      <div class="listing-item__image-wrapper">
          <img src="${imageSrc}" alt="${titleText}" class="listing-item__image">
      </div>
    `
        : "";

    this.shadowRoot.innerHTML = `
        <style>
          /* Import Bootstrap Icons if not globally available in shadow DOM */
          /* @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"); */
  
          :host {
            display: block;
            margin-bottom: 1rem;
          }
          .listing-item-card {
            display: flex;
            flex-direction: column;
            background-color: #fff;
            border-radius: 12px; /* Consistent rounded corners */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Softer shadow */
            transition: box-shadow 0.3s ease;
            overflow: hidden; /* Ensures image corners are rounded */
          }
          .listing-item-card:hover {
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          }
  
          .listing-item__image-wrapper {
              width: 100%;
              height: 180px; /* Fixed height for the image container */
              overflow: hidden;
          }
  
          .listing-item__image {
              width: 100%;
              height: 100%;
              object-fit: cover; /* Crop image to fit */
              display: block;
          }
  
  
          .listing-item__content {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          }
  
          .listing-item__main-info {
            flex-grow: 1;
          }
          .listing-item__address {
            font-size: 1.1rem;
            font-weight: 600;
            color: ${brandColors.darkNavy};
            margin-bottom: 0.25rem;
            line-height: 1.3;
          }
          .listing-item__location {
            font-size: 0.85rem;
            color: ${brandColors.darkNavy50};
            margin-bottom: 0.75rem;
            line-height: 1.4;
          }
          .details-list {
              list-style: none;
              padding: 0;
              margin: 0 0 0.75rem 0;
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem 1rem; /* vertical and horizontal gap */
          }
          .detail-item {
              display: flex;
              align-items: center;
              font-size: 0.85rem;
              color: ${brandColors.darkNavy80};
          }
          .detail-label {
              color: ${brandColors.darkNavy50};
              margin-right: 0.3rem;
          }
          .detail-value {
              font-weight: 500;
          }
  
          .listing-item__meta-and-price {
              display: flex;
              flex-direction: column;
              gap: 0.5rem; /* Space between meta row and price/status row */
              margin-bottom: 1rem;
          }
  
          .listing-item__meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem 1rem;
            font-size: 0.8rem;
            color: ${brandColors.darkNavy50};
            align-items: center;
          }
          .listing-item__meta span {
            display: flex;
            align-items: center;
          }
          .listing-item__meta i {
            margin-right: 0.3rem;
            font-size: 0.9em;
          }
          
          .listing-item__price-and-status {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: auto; /* Pushes to the bottom if content above is less */
          }
  
          .listing-item__price {
            font-size: 1.2rem;
            font-weight: 700;
            color: ${brandColors.turquoise};
          }
  
          .status-badge {
            padding: 0.3em 0.75em;
            border-radius: 1rem; /* Pill shape */
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
          }
          .status-badge--active {
            background-color: ${brandColors.limeGreen};
            color: ${brandColors.darkNavy};
          }
          .status-badge--archived {
            background-color: ${
              brandColors.darkNavy30
            }; /* Using 30% opacity of dark-navy */
            color: ${brandColors.darkNavy80};
          }
          .status-badge--draft {
            background-color: rgba(255, 193, 7, 0.2); /* Example: Bootstrap warning with opacity */
            color: #856404; /* Darker yellow for text */
            border: 1px solid rgba(255, 193, 7, 0.4);
          }
           .status-badge--unknown {
            background-color: #6c757d; /* Bootstrap secondary */
            color: white;
          }
  
          .listing-item__footer {
              border-top: 1px solid ${brandColors.lightGray};
              padding: 0.75rem 1rem;
              background-color: #f8f9fa; /* Light background for footer */
          }
  
          .listing-item__controls {
            display: flex;
            justify-content: flex-end; /* Align to the right */
            align-items: center;
            gap: 0.5rem; /* Space between buttons */
          }
          .action-btn {
            background-color: transparent;
            border: none;
            color: ${brandColors.darkNavy50};
            font-size: 1.25rem; /* Larger icons */
            cursor: pointer;
            padding: 0.3rem;
            transition: color 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .action-btn:hover {
            color: ${brandColors.turquoise};
          }
          .action-btn.action-btn--delete:hover {
            color: ${brandColors.brightPink};
          }
  
          @media (min-width: 768px) {
              .listing-item-card {
                  flex-direction: row;
              }
              .listing-item__image-wrapper {
                  width: 200px; /* Fixed width for image on larger screens */
                  height: auto; /* Auto height to maintain aspect ratio of content */
                  min-height: 100%; /* Ensure it stretches if content is taller */
                  flex-shrink: 0;
              }
              .listing-item__content {
                  display: flex;
                  flex-direction: column; /* Ensure content within is stacked */
                  justify-content: space-between; /* Distribute space */
                  flex-grow: 1;
              }
              .listing-item__main-info {
                  margin-bottom: auto; /* Push meta and price/status down */
              }
          }
  
        </style>
        <div class="listing-item-card">
          ${imageHtml}
          <div class="listing-item__content">
              <div class="listing-item__main-info">
                  <h5 class="listing-item__address">${titleText}</h5>
                  <p class="listing-item__location">${locationText}</p>
                  ${detailsHtml}
              </div>
              <div class="listing-item__meta-and-price">
                  <div class="listing-item__meta">
                      ${
                        dateText
                          ? `<span><i class="bi bi-calendar3"></i> ${dateText}</span>`
                          : ""
                      }
                      ${
                        viewsText
                          ? `<span><i class="bi bi-eye"></i> ${viewsText}</span>`
                          : ""
                      }
                      ${
                        favoritesText
                          ? `<span><i class="bi bi-heart"></i> ${favoritesText}</span>`
                          : ""
                      }
                  </div>
                  <div class="listing-item__price-and-status">
                      <span class="listing-item__price">${priceText}</span>
                      <span class="status-badge ${statusInfo.class}">${
      statusInfo.text
    }</span>
                  </div>
              </div>
               <div class="listing-item__footer">
                  ${actionButtonsHtml}
              </div>
          </div>
        </div>
      `;
  }

  _attachEventListeners() {
    this.shadowRoot.querySelectorAll(".action-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        // console.log(`Action: ${action}, ID: ${id}`);

        // Dispatch a custom event
        this.dispatchEvent(
          new CustomEvent("listingAction", {
            detail: { action, id },
            bubbles: true,
            composed: true,
          })
        );
      });
    });
  }
}

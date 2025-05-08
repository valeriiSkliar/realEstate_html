export class AppFavoriteProperty extends HTMLElement {
  static get observedAttributes() {
    return [
      "property-id",
      "title",
      "location",
      "price",
      "area",
      "rooms",
      "image",
    ];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const propertyId = this.getAttribute("property-id") || "";
    const title = this.getAttribute("title") || "";
    const location = this.getAttribute("location") || "";
    const price = this.getAttribute("price") || "";
    const area = this.getAttribute("area") || "";
    const rooms = this.getAttribute("rooms") || "";
    const image = this.getAttribute("image") || "/images/place-holder.jpg";

    this.innerHTML = `
      <div class="col-md-6 col-lg-4" data-property-id="${propertyId}">
        <div class="card property-card">
          <div class="property-card__favorite-btn js-remove-favorite" data-property-id="${propertyId}">
            <i class="bi bi-x-lg"></i>
          </div>
          <img src="${image}" class="card-img-top" alt="${title}" />
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text text-brand-dark-navy-30">${location}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="property-price">${price} ₽</span>
              <div class="property-stats">
                <span class="me-2"><i class="bi bi-rulers"></i> ${area}м²</span>
                <span><i class="bi bi-door-open"></i> ${rooms}</span>
              </div>
            </div>
            <a href="/property/${propertyId}" class="stretched-link"></a>
          </div>
        </div>
      </div>
    `;
  }
}

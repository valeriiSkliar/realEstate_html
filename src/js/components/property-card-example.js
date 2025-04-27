// Import the favorite button component
import { createFavoriteButton } from "./favorite-button";
import { isInFavorites } from "./favorites-manager";
export const initPropertyCardExample = () => {
  // Example function to add favorite button to a property card
  function addFavoriteButtonToCard(propertyCard, propertyId) {
    // Check if property is already in favorites
    const isFavorite = isInFavorites(propertyId);

    // Create the favorite button
    const favoriteButton = createFavoriteButton(propertyId, isFavorite);

    // Add the button to the property card
    propertyCard.appendChild(favoriteButton);
  }

  // Usage example
  const propertyCard = document.querySelector(".property-card");
  const propertyId = "prop123";

  if (propertyCard) {
    addFavoriteButtonToCard(propertyCard, propertyId);
  }
};

/**
 * Set current year in footer
 */
export const setCurrentYear = () => {
  const yearElements = document.querySelectorAll(".js-current-year");
  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });
};

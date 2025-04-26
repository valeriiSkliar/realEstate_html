
/**
 * Mobile menu functionality
 */
export const initMobileMenu = () => {
    const menuTrigger = document.querySelector('.js-menu-trigger');
    const menuClose = document.querySelector('.js-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.js-overlay');
    
    // Toggle menu function
    const toggleMenu = () => {
      mobileMenu.classList.toggle('is-active');
      overlay.classList.toggle('is-active');
      
      // Prevent body scrolling when menu is open
      if (mobileMenu.classList.contains('is-active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };
    
    // Open menu
    if (menuTrigger) {
      menuTrigger.addEventListener('click', toggleMenu);
    }
    
    // Close menu
    if (menuClose) {
      menuClose.addEventListener('click', toggleMenu);
    }
    
    // Close on overlay click
    if (overlay) {
      overlay.addEventListener('click', toggleMenu);
    }
    
    // Close menu when clicking on a menu item
    const menuItems = document.querySelectorAll('.mobile-menu__link');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        toggleMenu();
      });
    });
  };
  
  /**
   * Set current year in footer
   */
  export const setCurrentYear = () => {
    const yearElements = document.querySelectorAll('.js-current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
      element.textContent = currentYear;
    });
  };
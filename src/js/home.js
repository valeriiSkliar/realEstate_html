import { showModal, hideModal, showToast, createAndShowToast } from './utils/uiHelpers';
// Home page specific JavaScript
console.log('Home page loaded'); 

/**
 * Initialize profile page functionality
 */
export const initHomePage = () => {

    // Test modal
    // showModal('loginModal');

    // Test toast
    createAndShowToast('Профиль успешно обновлен!', 'success');
  };


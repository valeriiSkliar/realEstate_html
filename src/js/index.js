// src/js/index.js
import 'bootstrap';
import $ from 'jquery';
import { format } from 'date-fns';

// Import the styles - make sure this line is not commented out
import '../scss/main.scss';

import { initMobileMenu, setCurrentYear } from './menu';
import { initProfilePage } from './profile';

// Initialize components when DOM is ready
$(document).ready(function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Set current year in footer
    setCurrentYear();
    
    // Initialize profile page if we're on that page
    if (document.querySelector('.profile-page')) {
        initProfilePage();
    }
    
    // Additional initialization code here
    console.log('Styles should be loaded!');
});
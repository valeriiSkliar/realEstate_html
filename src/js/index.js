import 'bootstrap';
import $ from 'jquery';
import { format } from 'date-fns';
import { initMobileMenu, setCurrentYear } from './menu';

// Initialize components when DOM is ready
$(document).ready(function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Set current year in footer
    setCurrentYear();
    
    // Additional initialization code here
});
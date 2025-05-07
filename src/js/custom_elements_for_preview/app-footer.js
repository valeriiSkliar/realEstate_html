export class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <!-- Footer Component -->

      <footer class="footer">
        <div class="footer__container">
          <nav class="footer__nav">
            <a href="/about" class="footer__link text-brand-turquoise">About Us</a>
            <a href="/terms" class="footer__link text-brand-turquoise">Terms of Use</a>
            <a href="/privacy" class="footer__link text-brand-turquoise">Privacy Policy</a>
            <a href="/contact" class="footer__link text-brand-turquoise">Contact</a>
          </nav>
          <div class="footer__copyright text-brand-dark-navy">
            &copy; <span class="js-current-year">2025</span> Real Estate. All rights reserved.
          </div>
        </div>
      </footer>
    `;
  }
}

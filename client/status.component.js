
const getFooterMarkup = (text, backgroundColor, textColor) => {
  return `<footer class="footer mt-auto py-3" style="background-color: ${backgroundColor}; color: ${textColor}; margin-top:auto; position: fixed; bottom: 0; width: 100%">
        <div class="container">
          <div class="row">
            <span>${text}</span>
          </div>        
        </div>
      </footer>`;
};

class StatusElement extends HTMLElement {

  constructor() {
    super();

    window.addEventListener('offline', event => {
      this.innerHTML = getFooterMarkup('The app is currently offline.', '#FEF3CD', '#977B2E')
    });

    window.addEventListener('online', event => {
      this.innerHTML = getFooterMarkup('The app is back online.', '#D4ECDA', '#588E6A');
    });
  }
}

window.customElements.define('status-element', StatusElement);
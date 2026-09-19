// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : [];
}

// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener('touchend', (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener('click', callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function resolvePublicPath(path) {
  if (!path || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const pageIsNested =
    window.location.pathname.includes('/product_pages/') ||
    window.location.pathname.includes('/product_listing/') ||
    window.location.pathname.includes('/cart/') ||
    window.location.pathname.includes('/checkout/');
  const basePrefix = pageIsNested ? '../public/' : './public/';
  const cleanedPath = path
    .replace(/^\/+/, '')
    .replace(/^public\//, '')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\.\//, '');

  return `${basePrefix}${cleanedPath}`;
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  if (!parentElement) return;

  parentElement.innerHTML = template;

  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const response = await fetch(path);
  const template = await response.text();
  return template;
}

export async function loadHeaderFooter() {
  const currentPath = window.location.pathname;
  const partialPath =
    currentPath.includes('/cart/') ||
    currentPath.includes('/checkout/') ||
    currentPath.includes('/product_pages/') ||
    currentPath.includes('/product_listing/')
      ? '../public/partials/'
      : './public/partials/';

  const headerTemplate = await loadTemplate(`${partialPath}header.html`);
  const footerTemplate = await loadTemplate(`${partialPath}footer.html`);

  const headerElement = document.querySelector('#main-header');
  const footerElement = document.querySelector('#main-footer');

  renderWithTemplate(headerTemplate, headerElement);
  renderWithTemplate(footerTemplate, footerElement);
}

import {
  getLocalStorage,
  renderListWithTemplate,
  resolvePublicPath,
  setLocalStorage,
} from './utils.mjs';
import { getProductComments } from './ProductComments.mjs';

const MAX_QUANTITY = 99;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function itemKey(item) {
  return String(item.Id ?? item.Name ?? 'unknown');
}

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  return Number.isFinite(quantity) ? Math.min(MAX_QUANTITY, Math.max(1, quantity)) : 1;
}

// Merge duplicate legacy entries and give every cart item a valid quantity.
export function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];

  const mergedItems = new Map();
  items.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const key = itemKey(item);
    const quantity = normalizeQuantity(item.Quantity);
    const existingItem = mergedItems.get(key);
    if (existingItem) existingItem.Quantity = Math.min(MAX_QUANTITY, existingItem.Quantity + quantity);
    else mergedItems.set(key, { ...item, Quantity: quantity });
  });

  return [...mergedItems.values()];
}

// Calculate a cart total using each item's price and selected quantity.
export function calculateCartTotal(items) {
  return normalizeCartItems(items).reduce((total, item) => {
    const price = Number(item.FinalPrice);
    return total + (Number.isFinite(price) ? price : 0) * item.Quantity;
  }, 0);
}

// Return an updated cart with the selected item's quantity changed.
export function setCartItemQuantity(items, productId, quantity) {
  const key = String(productId);
  return normalizeCartItems(items).map((item) => (
    itemKey(item) === key ? { ...item, Quantity: normalizeQuantity(quantity) } : item
  ));
}

function cartItemTemplate(item) {
  const imageSrc = item.Images?.PrimaryMedium || item.Image || '';
  const productName = escapeHtml(item.Name || 'Product');
  const productColor = escapeHtml(item.Colors?.[0]?.ColorName || 'Color not specified');
  const productId = escapeHtml(item.Id ?? '');
  const detailsLink = `../product_pages/index.html?product=${encodeURIComponent(item.Id ?? '')}`;
  const unitPrice = Number(item.FinalPrice) || 0;
  const subtotal = unitPrice * item.Quantity;
  const comments = getProductComments(item.Id);
  const commentsMarkup = comments.length
    ? `<details class="cart-card__comments"><summary>${comments.length} product ${comments.length === 1 ? 'comment' : 'comments'}</summary><ul>${comments.map((comment) => `<li><strong>${escapeHtml(comment.author || 'Guest')}:</strong> ${escapeHtml(comment.body)}</li>`).join('')}</ul></details>`
    : '';
  const image = imageSrc
    ? `<img src="${escapeHtml(resolvePublicPath(imageSrc))}" alt="${productName}" />`
    : '<span class="cart-image-placeholder" aria-hidden="true">Image unavailable</span>';

  return `<li class="cart-card divider">
  <a href="${detailsLink}" class="cart-card__image">
    ${image}
  </a>
  <a href="${detailsLink}">
    <h2 class="card__name">${productName}</h2>
  </a>
  <p class="cart-card__color">${productColor}</p>
  <label class="cart-card__quantity">Quantity
    <input type="number" min="1" max="${MAX_QUANTITY}" step="1" value="${item.Quantity}" data-cart-quantity data-product-id="${productId}" aria-label="Quantity for ${productName}" />
  </label>
  <p class="cart-card__price">Unit price: $${unitPrice.toFixed(2)}</p>
  <p class="cart-card__subtotal">Item total: $${subtotal.toFixed(2)}</p>
  ${commentsMarkup}
</li>`;
}

export default class ShoppingCart {
  constructor(key, parentElement) {
    this.key = key;
    this.parentElement = parentElement;
    this.emptyState = document.querySelector('.cart-empty');
    this.footer = document.querySelector('.cart-footer');
    this.totalElement = document.querySelector('#cart-total-value');
  }

  init() {
    const cartItems = normalizeCartItems(getLocalStorage(this.key));
    setLocalStorage(this.key, cartItems);
    this.parentElement.addEventListener('change', (event) => this.handleQuantityChange(event));
    this.renderCart(cartItems);
  }

  renderCart(list) {
    if (!this.parentElement) return;

    const cartItems = normalizeCartItems(list);
    this.emptyState.hidden = cartItems.length > 0;
    this.footer.hidden = cartItems.length === 0;
    this.parentElement.replaceChildren();

    if (cartItems.length === 0) return;

    renderListWithTemplate(
      cartItemTemplate,
      this.parentElement,
      cartItems,
      'afterbegin',
      true,
    );
    this.totalElement.textContent = `$${calculateCartTotal(cartItems).toFixed(2)}`;
  }

  handleQuantityChange(event) {
    const input = event.target.closest('[data-cart-quantity]');
    if (!input) return;

    const quantity = normalizeQuantity(input.value);
    const cartItems = setCartItemQuantity(
      getLocalStorage(this.key),
      input.dataset.productId,
      quantity,
    );
    setLocalStorage(this.key, cartItems);
    this.renderCart(cartItems);
  }
}

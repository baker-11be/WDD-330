import {
  getLocalStorage,
  renderListWithTemplate,
  resolvePublicPath,
} from './utils.mjs';

function cartItemTemplate(item) {
  const imageSrc = item.Images?.PrimaryMedium || item.Image || '';

  return `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img src="${resolvePublicPath(imageSrc)}" alt="${item.Name}" />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;
}

export default class ShoppingCart {
  constructor(key, parentElement) {
    this.key = key;
    this.parentElement = parentElement;
  }

  init() {
    const cartItems = getLocalStorage(this.key);
    this.renderCart(cartItems);
  }

  renderCart(list) {
    if (!this.parentElement) return;

    renderListWithTemplate(
      cartItemTemplate,
      this.parentElement,
      list,
      'afterbegin',
      true,
    );
  }
}

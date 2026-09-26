import ShoppingCart from './ShoppingCart.mjs';
import { loadHeaderFooter } from './utils.mjs';

loadHeaderFooter();

const cart = new ShoppingCart(
  'so-cart',
  document.querySelector('.product-list'),
);

cart.init();

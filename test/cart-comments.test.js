import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  calculateCartTotal,
  normalizeCartItems,
  setCartItemQuantity,
} from '../src/js/ShoppingCart.mjs';
import {
  addProductComment,
  getProductComments,
} from '../src/js/ProductComments.mjs';

const values = new Map();
global.localStorage = {
  getItem(key) {
    return values.get(key) ?? null;
  },
  setItem(key, value) {
    values.set(key, value);
  },
};

const tent = { Id: 'tent-1', Name: 'Trail Tent', FinalPrice: 100 };

beforeEach(() => values.clear());

describe('SleepOutside cart', () => {
  it('normalizes duplicate legacy cart records into quantities', () => {
    const cart = normalizeCartItems([tent, tent, { ...tent, Quantity: 2 }]);

    assert.equal(cart.length, 1);
    assert.equal(cart[0].Quantity, 4);
  });

  it('updates item quantity and recalculates the cart total', () => {
    const cart = setCartItemQuantity([tent], 'tent-1', 3);

    assert.equal(cart[0].Quantity, 3);
    assert.equal(calculateCartTotal(cart), 300);
  });

  it('treats empty or invalid cart data as an empty list', () => {
    assert.deepEqual(normalizeCartItems(null), []);
    assert.equal(calculateCartTotal([]), 0);
  });
});

describe('Product comments', () => {
  it('saves comments separately for each product and uses Guest for a blank name', () => {
    addProductComment('tent-1', { author: '', body: 'Roomy and easy to set up.' });
    addProductComment('pack-2', { author: 'Sam', body: 'Comfortable straps.' });

    assert.equal(getProductComments('tent-1')[0].author, 'Guest');
    assert.equal(getProductComments('tent-1').length, 1);
    assert.equal(getProductComments('pack-2')[0].body, 'Comfortable straps.');
  });

  it('does not save blank comments', () => {
    addProductComment('tent-1', { body: '   ' });

    assert.deepEqual(getProductComments('tent-1'), []);
  });
});

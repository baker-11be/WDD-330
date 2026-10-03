import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ProductData from '../src/js/ProductData.mjs';
import ProductDetails from '../src/js/ProductDetails.mjs';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');

const currentDir = dirname(fileURLToPath(import.meta.url));
const stylesheet = readFileSync(resolve(currentDir, '../src/css/style.css'), 'utf8');

// Renders a product through ProductDetails with a minimal fake document so the
// price line and discount flag can be inspected without a real browser.
function renderProductDetails(product) {
  const productImage = { src: '', alt: '' };
  const productName = { textContent: '' };
  const productBrand = { textContent: '' };
  const productPrice = { textContent: '$0.00', innerHTML: '$0.00' };
  const productDiscount = { textContent: '', hidden: true };
  const productColor = { textContent: '' };
  const productDescription = { innerHTML: '' };

  global.document = {
    querySelector(selector) {
      const elements = {
        '.product-detail img': productImage,
        '.product-detail h2': productName,
        '.product-detail h3': productBrand,
        '.product-card__price': productPrice,
        '.product__discount': productDiscount,
        '.product__color': productColor,
        '.product__description': productDescription,
      };

      return elements[selector] ?? null;
    },
  };

  const details = new ProductDetails(product.Id, {
    findProductById: async () => product,
  });
  details.product = product;
  details.renderProductDetails();

  return { productPrice, productDiscount };
}

describe('ProductData search', () => {
  it('filters products by search text', async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        Result: [
          {
            Id: '1',
            Name: 'Marmot Ajax Tent',
            DescriptionHtmlSimple: 'A durable 3-season tent for camping.',
            Brand: { Name: 'Marmot' },
            FinalPrice: 199.99,
          },
          {
            Id: '2',
            Name: 'North Face Talus Tent',
            DescriptionHtmlSimple: 'A roomy shelter for family trips.',
            Brand: { Name: 'The North Face' },
            FinalPrice: 249.99,
          },
        ],
      }),
    });

    const dataSource = new ProductData();
    const results = await dataSource.searchProducts('ajax');

    assert.equal(results.length, 1);
    assert.equal(results[0].Name, 'Marmot Ajax Tent');
  });
});

describe('ProductDetails discount flag', () => {
  it('shows the discount flag when ListPrice is higher than FinalPrice', () => {
    const { productPrice, productDiscount } = renderProductDetails({
      Id: '1',
      Name: 'Marmot Ajax Tent',
      Brand: { Name: 'Marmot' },
      Images: { PrimaryLarge: 'tent.jpg' },
      ListPrice: 199.99,
      FinalPrice: 149.99,
      Colors: [{ ColorName: 'Pale Pumpkin/Terracotta' }],
      DescriptionHtmlSimple: '<p>Cool tent</p>',
    });

    assert.match(productPrice.innerHTML, /199\.99/);
    assert.match(productPrice.innerHTML, /149\.99/);
    assert.equal(productDiscount.textContent, 'Save 25%');
    assert.equal(productDiscount.hidden, false);
  });

  it('shows the real catalog discount from SuggestedRetailPrice (Marmot Ajax Tent 880RR)', () => {
    const { productPrice, productDiscount } = renderProductDetails({
      Id: '880RR',
      Name: 'Marmot Ajax Tent - 3-Person, 3-Season',
      Brand: { Name: 'Marmot' },
      Images: { PrimaryLarge: 'tent.jpg' },
      SuggestedRetailPrice: 300,
      ListPrice: 199.99,
      FinalPrice: 199.99,
      Colors: [{ ColorName: 'Pale Pumpkin/Terracotta' }],
      DescriptionHtmlSimple: '<p>Cool tent</p>',
    });

    assert.match(productPrice.innerHTML, /\$300\.00/);
    assert.match(productPrice.innerHTML, /199\.99/);
    assert.equal(productDiscount.textContent, 'Save 33%');
    assert.equal(productDiscount.hidden, false);
  });

  it('hides the discount flag on a product that is not discounted', () => {
    const { productDiscount } = renderProductDetails({
      Id: '2',
      Name: 'Full Price Tent',
      Brand: { Name: 'Generic' },
      Images: { PrimaryLarge: 'tent.jpg' },
      SuggestedRetailPrice: 149.99,
      ListPrice: 149.99,
      FinalPrice: 149.99,
      Colors: [{ ColorName: 'Blue' }],
      DescriptionHtmlSimple: '<p>No discount</p>',
    });

    assert.equal(productDiscount.textContent, '');
    assert.equal(productDiscount.hidden, true);
  });
});

describe('Discount flag CSS', () => {
  const markup = `<!doctype html><html><head><style>${stylesheet}</style></head><body><p class="product__discount" hidden></p></body></html>`;

  it('keeps the flag hidden while the hidden attribute is set', () => {
    const { window } = new JSDOM(markup);
    const badge = window.document.querySelector('.product__discount');

    assert.equal(window.getComputedStyle(badge).display, 'none');
  });

  it('renders the flag as an inline-block badge once it is shown', () => {
    const { window } = new JSDOM(markup);
    const badge = window.document.querySelector('.product__discount');
    badge.hidden = false;

    assert.equal(window.getComputedStyle(badge).display, 'inline-block');
  });
});

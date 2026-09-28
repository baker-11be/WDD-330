import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import ProductData from '../src/js/ProductData.mjs';
import ProductDetails from '../src/js/ProductDetails.mjs';

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

  it('shows a discount flag on product detail when the list price is higher than the final price', () => {
    const productPrice = { textContent: '$0.00', innerHTML: '$0.00' };
    const productDiscount = { textContent: '', hidden: true };
    const productColor = { textContent: '' };
    const productDescription = { innerHTML: '' };
    const productImage = { src: '', alt: '' };
    const productName = { textContent: '' };
    const productBrand = { textContent: '' };

    global.document = {
      querySelector(selector) {
        const map = {
          '.product-detail img': productImage,
          '.product-detail h2': productName,
          '.product-detail h3': productBrand,
          '.product-card__price': productPrice,
          '.product__discount': productDiscount,
          '.product__color': productColor,
          '.product__description': productDescription,
        };

        return map[selector] ?? null;
      },
    };

    const product = {
      Id: '1',
      Name: 'Marmot Ajax Tent',
      Brand: { Name: 'Marmot' },
      Images: { PrimaryLarge: 'tent.jpg' },
      FinalPrice: 149.99,
      ListPrice: 199.99,
      Colors: [{ ColorName: 'Pale Pumpkin/Terracotta' }],
      DescriptionHtmlSimple: '<p>Cool tent</p>',
    };

    const details = new ProductDetails('1', { findProductById: async () => product });
    details.product = product;
    details.renderProductDetails();

    assert.match(productPrice.innerHTML, /149\.99/);
    assert.equal(productDiscount.textContent, 'Save 25%');
    assert.equal(productDiscount.hidden, false);
  });
});

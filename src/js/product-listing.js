import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';
import { getParam, loadHeaderFooter } from './utils.mjs';

loadHeaderFooter();

const category = getParam('category') || 'tents';
const query = getParam('query');
const dataSource = new ProductData();
const listElement = document.querySelector('.product-list');

if (listElement) {
  const title = document.querySelector('#product-listing-title');

  const renderSearchResults = async () => {
    if (!query) {
      const productList = new ProductList(category, dataSource, listElement);
      productList.init();
      return;
    }

    if (title) {
      title.textContent = `Search Results: "${query}"`;
    }

    const results = await dataSource.searchProducts(query, category);
    const productList = new ProductList(category, dataSource, listElement);
    productList.renderList(results);
  };

  renderSearchResults();
}

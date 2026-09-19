import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';
import { getParam, loadHeaderFooter } from './utils.mjs';

loadHeaderFooter();

const category = getParam('category') || 'tents';
const dataSource = new ProductData();
const listElement = document.querySelector('.product-list');

if (listElement) {
  const productList = new ProductList(category, dataSource, listElement);
  productList.init();
}

import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';
import Alert from './Alert.js';
import { loadHeaderFooter } from './utils.mjs';

loadHeaderFooter();

const dataSource = new ProductData('tents');
const listElement = document.querySelector('.product-list');

if (listElement) {
  const productList = new ProductList('tents', dataSource, listElement);
  productList.init();
}

const alerts = new Alert();
alerts.init();

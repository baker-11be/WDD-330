import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';

const dataSource = new ProductData('tents');
const listElement = document.querySelector('.product-list');

if (listElement) {
  const productList = new ProductList('tents', dataSource, listElement);
  productList.init();
}

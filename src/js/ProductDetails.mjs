import { getLocalStorage, setLocalStorage } from './utils.mjs';

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = null;
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);

    if (!this.product) {
      return;
    }

    this.renderProductDetails();
    document.getElementById('addToCart').addEventListener('click', () => {
      this.addProductToCart(this.product);
    });
  }

  addProductToCart(product) {
    const cartItems = getLocalStorage('so-cart') ?? [];
    cartItems.push(product);
    setLocalStorage('so-cart', cartItems);
  }

  renderProductDetails() {
    const productImage = document.querySelector('.product-detail img');
    const productName = document.querySelector('.product-detail h2');
    const productBrand = document.querySelector('.product-detail h3');
    const productPrice = document.querySelector('.product-card__price');
    const productColor = document.querySelector('.product__color');
    const productDescription = document.querySelector('.product__description');

    if (productImage) productImage.src = this.product.Image;
    if (productImage) productImage.alt = this.product.Name;
    if (productName) productName.textContent = this.product.Name;
    if (productBrand) productBrand.textContent = this.product.Brand.Name;
    if (productPrice) productPrice.textContent = `$${this.product.FinalPrice}`;
    if (productColor) productColor.textContent = this.product.Colors[0].ColorName;
    if (productDescription) productDescription.textContent = this.product.DescriptionHtmlSimple;
  }
}

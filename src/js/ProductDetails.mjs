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
    const addToCartButton = document.getElementById('addToCart');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', this.addProductToCart.bind(this));
    }
  }

  addProductToCart() {
    const cartItems = getLocalStorage('so-cart') ?? [];
    cartItems.push(this.product);
    setLocalStorage('so-cart', cartItems);
  }

  // The original ("was") price. Items in this catalog are discounted from the
  // manufacturer's SuggestedRetailPrice, while ListPrice normally equals
  // FinalPrice. Falling back to ListPrice keeps any data that only has a list
  // price working exactly as it did before.
  getWasPrice() {
    const suggestedRetailPrice = Number(this.product?.SuggestedRetailPrice ?? 0);
    const listPrice = Number(this.product?.ListPrice ?? 0);
    return Math.max(suggestedRetailPrice, listPrice);
  }

  getDiscountPercent() {
    const wasPrice = this.getWasPrice();
    const finalPrice = Number(this.product?.FinalPrice ?? 0);

    if (!wasPrice || !finalPrice || finalPrice >= wasPrice) {
      return 0;
    }

    return Math.round(((wasPrice - finalPrice) / wasPrice) * 100);
  }

  renderProductDetails() {
    const productImage = document.querySelector('.product-detail img');
    const productName = document.querySelector('.product-detail h2');
    const productBrand = document.querySelector('.product-detail h3');
    const productPrice = document.querySelector('.product-card__price');
    const productDiscount = document.querySelector('.product__discount');
    const productColor = document.querySelector('.product__color');
    const productDescription = document.querySelector('.product__description');

    if (productImage) productImage.src = this.product.Images.PrimaryLarge;
    if (productImage) productImage.alt = this.product.Name;
    if (productName) productName.textContent = this.product.Name;
    if (productBrand) productBrand.textContent = this.product.Brand.Name;

    const discountPercent = this.getDiscountPercent();
    const wasPrice = this.getWasPrice();
    if (productPrice) {
      if (wasPrice > 0 && discountPercent > 0) {
        productPrice.innerHTML = `<span class="product-card__price--list">$${wasPrice.toFixed(2)}</span> $${Number(this.product.FinalPrice).toFixed(2)}`;
      } else {
        productPrice.textContent = `$${Number(this.product.FinalPrice).toFixed(2)}`;
      }
    }

    if (productDiscount) {
      if (discountPercent > 0) {
        productDiscount.textContent = `Save ${discountPercent}%`;
        productDiscount.hidden = false;
      } else {
        productDiscount.textContent = '';
        productDiscount.hidden = true;
      }
    }

    if (productColor) productColor.textContent = this.product.Colors[0].ColorName;
    if (productDescription) productDescription.innerHTML = this.product.DescriptionHtmlSimple;
  }
}

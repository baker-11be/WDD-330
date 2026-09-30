import { getLocalStorage, setLocalStorage } from './utils.mjs';
import { addProductComment, getProductComments } from './ProductComments.mjs';

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = null;
    this.dataSource = dataSource;
  }

  async init() {
    const loadingMessage = document.querySelector('#product-loading');
    const errorMessage = document.querySelector('#product-error');
    const productSection = document.querySelector('#product-detail');
    const commentsSection = document.querySelector('.product-comments');
    const addToCartButton = document.getElementById('addToCart');

    try {
      if (!this.productId) throw new Error('A product ID is required.');
      this.product = await this.dataSource.findProductById(this.productId);
      if (!this.product) throw new Error('The requested product was not found.');

      this.renderProductDetails();
      productSection.hidden = false;
      commentsSection.hidden = false;
      loadingMessage.hidden = true;
      addToCartButton.disabled = false;
      addToCartButton.dataset.id = this.productId;
      addToCartButton.addEventListener('click', this.addProductToCart.bind(this));
      document
        .querySelector('#comment-form')
        ?.addEventListener('submit', this.addComment.bind(this));
      this.renderComments();
    } catch {
      loadingMessage.hidden = true;
      errorMessage.hidden = false;
      return;
    }
  }

  addProductToCart() {
    const cartItems = getLocalStorage('so-cart');
    const existingItem = cartItems.find((item) => String(item.Id) === String(this.product.Id));
    const comments = getProductComments(this.productId);

    if (existingItem) {
      existingItem.Quantity = (Number(existingItem.Quantity) || 1) + 1;
      existingItem.Comments = comments;
    } else {
      cartItems.push({ ...this.product, Quantity: 1, Comments: comments });
    }
    setLocalStorage('so-cart', cartItems);
    window.location.assign('/cart/index.html');
  }

  addComment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const author = form.elements.author.value.trim();
    const body = form.elements.body.value.trim();
    if (!body) return;

    addProductComment(this.productId, { author, body });
    this.renderComments();
    form.reset();
  }

  renderComments() {
    const list = document.querySelector('#product-comments-list');
    const emptyMessage = document.querySelector('#comment-empty');
    if (!list || !emptyMessage) return;

    const comments = getProductComments(this.productId);
    emptyMessage.hidden = comments.length > 0;
    list.replaceChildren(...comments.map((comment) => {
      const item = document.createElement('li');
      item.className = 'product-comment';
      const meta = document.createElement('div');
      meta.className = 'product-comment__meta';
      const author = document.createElement('strong');
      author.textContent = comment.author || 'Guest';
      const date = document.createElement('time');
      const parsedDate = new Date(comment.createdAt);
      if (!Number.isNaN(parsedDate.getTime())) {
        date.dateTime = parsedDate.toISOString();
        date.textContent = parsedDate.toLocaleDateString();
      }
      const body = document.createElement('p');
      body.textContent = comment.body;
      meta.append(author, date);
      item.append(meta, body);
      return item;
    }));
  }

  getDiscountPercent() {
    const listPrice = Number(this.product?.ListPrice ?? 0);
    const finalPrice = Number(this.product?.FinalPrice ?? 0);

    if (!listPrice || !finalPrice || finalPrice >= listPrice) {
      return 0;
    }

    return Math.round(((listPrice - finalPrice) / listPrice) * 100);
  }

  renderProductDetails() {
    const productImage = document.querySelector('.product-detail img');
    const productName = document.querySelector('.product-detail h2');
    const productBrand = document.querySelector('.product-detail h3');
    const productPrice = document.querySelector('.product-card__price');
    const productDiscount = document.querySelector('.product__discount');
    const productColor = document.querySelector('.product__color');
    const productDescription = document.querySelector('.product__description');

    if (productImage) productImage.src = this.product.Images?.PrimaryLarge || this.product.Images?.PrimaryMedium || '';
    if (productImage) productImage.alt = this.product.Name;
    if (productName) productName.textContent = this.product.Name;
    if (productBrand) productBrand.textContent = this.product.Brand?.Name || '';

    const discountPercent = this.getDiscountPercent();
    if (productPrice) {
      const listPrice = Number(this.product.ListPrice ?? 0);
      if (listPrice > 0 && discountPercent > 0) {
        productPrice.innerHTML = `<span class="product-card__price--list">$${listPrice.toFixed(2)}</span> $${this.product.FinalPrice.toFixed(2)}`;
      } else {
        productPrice.textContent = `$${Number(this.product.FinalPrice || 0).toFixed(2)}`;
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

    if (productColor) productColor.textContent = this.product.Colors?.[0]?.ColorName || '';
    if (productDescription) productDescription.innerHTML = this.product.DescriptionHtmlSimple || '';
  }
}

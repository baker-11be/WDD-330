import { getLocalStorage, setLocalStorage } from './utils.mjs';
import Comments from './Comments.js';

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

    this.comments = new Comments(this.product.Category);
    this.renderProductDetails();
    const addToCartButton = document.getElementById('addToCart');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', this.addProductToCart.bind(this));
    }

    document
      .querySelector('#comment-form')
      ?.addEventListener('submit', this.handleCommentSubmit.bind(this));
    this.renderComments();
  }

  addProductToCart() {
    const cartItems = getLocalStorage('so-cart') ?? [];
    cartItems.push(this.product);
    setLocalStorage('so-cart', cartItems);
  }

  handleCommentSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const productKey = this.product.Id || this.productId;
    const author = form.elements.author.value;
    const commentText = form.elements.comment.value;

    if (!this.comments.addComment(productKey, commentText, author)) return;

    form.reset();
    this.renderComments();
  }

  renderComments() {
    const commentsList = document.querySelector('#comments-list');
    const emptyMessage = document.querySelector('#comments-empty');
    if (!commentsList || !emptyMessage || !this.comments) return;

    const productKey = this.product.Id || this.productId;
    const comments = this.comments.getComments(productKey);
    emptyMessage.hidden = comments.length > 0;
    commentsList.replaceChildren(...comments.map((comment) => {
      const listItem = document.createElement('li');
      listItem.className = 'product-comment';

      const metadata = document.createElement('div');
      metadata.className = 'product-comment__metadata';

      const author = document.createElement('strong');
      author.textContent = comment.author;

      const date = document.createElement('time');
      const parsedDate = new Date(comment.date);
      if (!Number.isNaN(parsedDate.getTime())) {
        date.dateTime = parsedDate.toISOString();
        date.textContent = parsedDate.toLocaleDateString();
      }

      const content = document.createElement('p');
      content.textContent = comment.content;

      metadata.append(author, date);
      listItem.append(metadata, content);
      return listItem;
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

    if (productImage) productImage.src = this.product.Images.PrimaryLarge;
    if (productImage) productImage.alt = this.product.Name;
    if (productName) productName.textContent = this.product.Name;
    if (productBrand) productBrand.textContent = this.product.Brand.Name;

    const discountPercent = this.getDiscountPercent();
    if (productPrice) {
      const listPrice = Number(this.product.ListPrice ?? 0);
      if (listPrice > 0 && discountPercent > 0) {
        productPrice.innerHTML = `<span class="product-card__price--list">$${listPrice.toFixed(2)}</span> $${this.product.FinalPrice.toFixed(2)}`;
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

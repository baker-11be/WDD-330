export default class Comments {
  constructor(category) {
    this.category = category || 'products';
    this.storageKey = `comments-${this.category}`;
  }

  getAllComments() {
    try {
      const comments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return Array.isArray(comments) ? comments : [];
    } catch {
      return [];
    }
  }

  getComments(productKey) {
    const key = String(productKey);
    return this.getAllComments().filter((comment) => comment.productKey === key);
  }

  addComment(productKey, commentText, author = 'Guest') {
    const content = String(commentText || '').trim();
    if (!content) return null;

    const comment = {
      productKey: String(productKey),
      author: String(author || '').trim() || 'Guest',
      date: new Date().toISOString(),
      content,
    };
    const comments = this.getAllComments();
    comments.push(comment);
    localStorage.setItem(this.storageKey, JSON.stringify(comments));
    return comment;
  }
}
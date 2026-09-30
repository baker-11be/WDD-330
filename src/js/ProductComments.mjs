const STORAGE_PREFIX = 'so-comments-';

// Load comments for one product, ignoring invalid saved data.
export function getProductComments(productId) {
  try {
    const comments = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${productId}`) || '[]');
    return Array.isArray(comments) ? comments : [];
  } catch {
    return [];
  }
}

// Save a non-empty comment under its product's localStorage key.
export function addProductComment(productId, { author = '', body = '' }) {
  const text = body.trim();
  if (!text) return getProductComments(productId);

  const comments = [
    ...getProductComments(productId),
    {
      author: author.trim() || 'Guest',
      body: text,
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`${STORAGE_PREFIX}${productId}`, JSON.stringify(comments));
  return comments;
}
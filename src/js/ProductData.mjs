const baseURL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SERVER_URL
    : 'https://wdd330-backend.onrender.com/';

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error('Bad Response');
  }
}

export default class ProductData {
  async getData(category) {
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async searchProducts(query, category = 'tents') {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const items = await this.getData(category);
    const searchString = trimmedQuery.toLowerCase();

    return items.filter((product) => {
      const name = product.Name?.toLowerCase() ?? '';
      const description = product.DescriptionHtmlSimple?.toLowerCase() ?? '';
      return name.includes(searchString) || description.includes(searchString);
    });
  }
}

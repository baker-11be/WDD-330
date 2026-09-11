import ProductData from "../js/ProductData.mjs";
import { getParam } from "../js/utils.mjs";
import ProductDetails from "../js/ProductDetails.mjs";

describe("ProductData", () => {
  it("finds a product by its Id", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ Id: "880RR", Name: "Marmot Ajax" }],
    });

    const dataSource = new ProductData("tents");
    const product = await dataSource.findProductById("880RR");

    expect(product.Name).toBe("Marmot Ajax");
  });
});

describe("getParam", () => {
  it("returns the requested URL parameter", () => {
    global.window = { location: { search: "?product=880RR" } };

    expect(getParam("product")).toBe("880RR");
  });
});

describe("ProductDetails", () => {
  it("stores products in the cart as an array", () => {
    const product = { Id: "880RR", Name: "Marmot Ajax" };
    const storage = [];

    global.localStorage = {
      getItem: jest.fn(() => JSON.stringify(storage)),
      setItem: jest.fn((key, value) => {
        storage.length = 0;
        storage.push(...JSON.parse(value));
      }),
    };

    const instance = new ProductDetails("880RR", new ProductData("tents"));
    instance.addProductToCart(product);

    expect(storage).toEqual([product]);
  });
});

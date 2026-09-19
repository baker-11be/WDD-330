import ProductData from '../src/js/ProductData.mjs';

describe('ProductData search', () => {
  it('filters products by search text', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Result: [
          {
            Id: '1',
            Name: 'Marmot Ajax Tent',
            DescriptionHtmlSimple: 'A durable 3-season tent for camping.',
            Brand: { Name: 'Marmot' },
            FinalPrice: 199.99,
          },
          {
            Id: '2',
            Name: 'North Face Talus Tent',
            DescriptionHtmlSimple: 'A roomy shelter for family trips.',
            Brand: { Name: 'The North Face' },
            FinalPrice: 249.99,
          },
        ],
      }),
    });

    const dataSource = new ProductData();
    const results = await dataSource.searchProducts('ajax');

    expect(results).toHaveLength(1);
    expect(results[0].Name).toBe('Marmot Ajax Tent');
  });
});

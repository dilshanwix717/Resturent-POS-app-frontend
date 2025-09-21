import React, { useState, useEffect } from 'react';
import { fetchCategories, fetchProductsStock } from '../../../api/apiService';

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockData, setStockData] = useState([]);
  const [categories, setCategories] = useState([]);
  const shopId = localStorage.getItem('shopId');
  const companyId = localStorage.getItem('companyId');

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const products = await fetchProductsStock();
        const filteredProducts = products.filter(
          (product) =>
            product.companyId === companyId &&
            product.activeShopIds.includes(shopId) &&
            product.productType.split(',').map((type) => type.trim()).includes('Finished Good') &&
            product.toggle === 'enable'
        );
        setStockData(filteredProducts);
        console.log(filteredProducts);

        // Fetch categories
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [shopId, companyId]);

  // Map category IDs to category names
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.categoryId] = category.categoryName;
    return acc;
  }, {});

  // Filter stock data based on the search term
  const filteredStock = stockData.filter((stock) => {
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase()) || stock.productId.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="slider h-screen-80px flex px-5 flex-col w-full overflow-auto">
      <p className="text-base font-bold py-2">Total Inventory at Stocks</p>
      <div className="flex items-center justify-between pb-3">
        <div className="flex w-1/3">
          <input
            className="block w-full rounded-l-md border-2 border-secondary text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight"
            id="text"
            placeholder="Search Product/ID"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          <button className="bg-secondary text-white text-nowrap font-medium px-4 text-xs xl:text-sm rounded-r-md 2xl:text-sm hover:shadow-lg transition duration-300">
            Search
          </button>
        </div>
      </div>
      <div className="flex flex-col w-full h-full overflow-hidden break-words text-xs xl:text-sm">
        <div className="shadow-md rounded-md w-full flex flex-col overflow-hidden gap-2">
          <div className="grid grid-cols-8 w-full font-bold bg-primary py-2 border-b border-gray-300">
            <p className="pl-5">No</p>
            <p className="pl-5">Product ID</p>
            <p className="pl-5 col-span-2">Name</p>
            <p className="pl-5">Size</p>
            <p className="pl-5">PLU Code</p>
            <p className="pl-5">Stock Available</p>
            <p className="pl-5">Category</p>
          </div>
          <div className="slider h-full overflow-auto">
            {filteredStock.map((stock, index) => (
              <div key={stock._id} className="grid grid-cols-8 items-center border-b border-gray-300">
                <p className="p-2 pl-5">{index + 1}</p>
                <p className="p-2 pl-5 ">{stock.productId}</p>
                <p className="p-2 pl-5 col-span-2">{stock.name}</p>
                <p className="p-2 pl-5">{stock.size}</p>
                <p className="p-2 pl-5">{stock.pluCode}</p>
                <p className="p-2 pl-5">{stock.stockDetails.numberOfProductsAvailable}</p>
                <p className="p-2 pl-5">{categoryMap[stock.categoryId] || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;

import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const SearchBar = ({ searchQuery, onSearch, products, onAddToCart }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: "",
    size: "Regular",
    price: 0,
    deviceLocation: "Hot Kitchen",
  });
  const suggestionBoxRef = useRef(null);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");
  const shopId = localStorage.getItem("shopId");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateFinalPrice = (price, commission) => {
    const parsedCommission = parseFloat(commission || "0");
    return price + parsedCommission;
  };

  const applyDiscount = (price, discount, discountDateRange) => {
    if (!discount || !discountDateRange) return price;

    const [from, to] = discountDateRange
      .replace("From:", "")
      .replace("to:", "")
      .split(" ")
      .map((date) => new Date(date.trim()));

    const currentDate = new Date();

    if (currentDate >= from && currentDate <= to) {
      if (discount.endsWith("%")) {
        const discountPercentage = parseFloat(discount.replace("%", ""));
        return price - (price * discountPercentage) / 100;
      } else if (!isNaN(parseFloat(discount))) {
        const discountAmount = parseFloat(discount);
        return price - discountAmount;
      }
    }

    return price;
  };

  const handleSearch = (query) => {
    onSearch(query);
    const suggestionList = products.filter(
      (product) =>
        (product.pluCode && product.pluCode.toLowerCase().includes(query.toLowerCase())) ||
        (product.name && product.name.toLowerCase().includes(query.toLowerCase()))
    );
    setSuggestions(query ? suggestionList.slice(0, 5) : []);
  };

  const handleSuggestionClick = (product) => {
    const finalPrice = calculateFinalPrice(
      product.sellingPrice,
      product.sellingTypeCommission
    );
    const discountedPrice = applyDiscount(
      finalPrice,
      product.discount,
      product.discountDateRange
    );

    onAddToCart({
      ...product,
      price: discountedPrice,
      finalPrice: discountedPrice,
    });
    setSuggestions([]);
  };

  const handleAddCustomProduct = () => {
    // Validate required fields
    if (!customProduct.name.trim() || !customProduct.price || !customProduct.size || !customProduct.deviceLocation) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    const customProductData = {
      _id: uuidv4(), // Generate a unique ID
      productId: `ProductID-212`, // Generate a unique product ID
      pluCode: "0",
      companyId,
      name: customProduct.name,
      productType: "Finished Good",
      uomId: "UOMId-1",
      size: customProduct.size,
      activeShopIds: [shopId],
      toggle: "enable",
      createdBy: userId,
      categoryId: "CategoryID-0",
      minQty: 1,
      deviceLocation: customProduct.deviceLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
      bomId: "BomId-0",
      sellingPrice: parseFloat(customProduct.price),
      finalPrice: parseFloat(customProduct.price),
      discount: "0.00",
      discountDateRange: "From: to:",
      sellingTypeCommission: "+0.00",
    };
  
    onAddToCart(customProductData);
    setShowCustomProductModal(false);
    setCustomProduct({ name: "", size: "Regular", price: 0, deviceLocation: "Hot Kitchen" });
  };
  

  return (
    <div className="flex w-2/3 relative mb-4 gap-2">
      <input
        type="text"
        className="block w-full rounded-md border-2 text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight"
        placeholder="Search by PLU Code, Product ID, or Name..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul
          ref={suggestionBoxRef}
          className="absolute w-full mt-10 bg-white rounded-md shadow-lg z-10"
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.pluCode}
              className="cursor-pointer p-2 hover:bg-gray-200"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.name} - {suggestion.size} ({suggestion.pluCode})
            </li>
          ))}
        </ul>
      )}
      <button
        className="bg-secondary text-white text-nowrap font-medium px-4 text-xs rounded-md xl:text-sm hover:shadow-lg transition duration-300"
        onClick={() => setShowCustomProductModal(true)}
      >
        Add Custom Product
      </button>

      {showCustomProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-4 rounded-lg shadow-md w-1/3">
            <h2 className="text-lg font-bold mb-4">Add Custom Product</h2>
            <input
              type="text"
              className="block w-full mb-2 rounded-md border-2 px-4 py-2"
              placeholder="Product Name"
              value={customProduct.name}
              onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
            />
            <select
              className="block w-full mb-2 rounded-md border-2 px-4 py-2"
              value={customProduct.size}
              onChange={(e) => setCustomProduct({ ...customProduct, size: e.target.value })}
            >
              <option value="Regular">Regular</option>
              <option value="Small">Small</option>
              <option value="Large">Large</option>
            </select>
            <input
              type="number"
              className="block w-full mb-2 rounded-md border-2 px-4 py-2"
              placeholder="Price"
              value={customProduct.price}
              onChange={(e) => setCustomProduct({ ...customProduct, price: e.target.value })}
            />
            <select
              className="block w-full mb-2 rounded-md border-2 px-4 py-2"
              value={customProduct.deviceLocation}
              onChange={(e) => setCustomProduct({ ...customProduct, deviceLocation: e.target.value })}
            >
              <option value="Hot Kitchen">Hot Kitchen</option>
              <option value="Cold Kitchen">Cold Kitchen</option>
            </select>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2"
                onClick={() => setShowCustomProductModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-secondary text-white px-4 py-2 rounded-md"
                onClick={handleAddCustomProduct}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

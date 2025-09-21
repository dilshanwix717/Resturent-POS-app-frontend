import React, { useState, useEffect } from "react";
import { fetchCategories, fetchProducts } from "../../../api/apiService";
import SearchBar from "./SearchBar";
import CategoryBar from "./CategoryBar";
import ProductGrid from "./ProductGrid";
import Cart from "./Cart";

const POS = ({ selectedOption }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);

  const shopId = localStorage.getItem("shopId");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoryResponse = await fetchCategories();
        const allItemsCategory = { categoryName: "All Items", categoryId: "all-items" };
        const enabledCategories = categoryResponse.filter(
          (category) =>
            category.toggle !== "disable" &&
            category.categoryName !== "Ingrediants" &&
            category.categoryName !== "Raw Material" &&
            category.companyId === localStorage.getItem("companyId")
        );
        setCategories([allItemsCategory, ...enabledCategories]);
        setSelectedCategory(allItemsCategory.categoryId);

        const productResponse = await fetchProducts();
        const filtered = productResponse.filter(
          (product) =>
            product.toggle !== "disable" &&
            product.productType === "Finished Good" &&
            product.activeShopIds.includes(shopId)
        );
        setProducts(filtered);
        setFilteredProducts(filtered);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    const filtered =
      categoryId === "all-items"
        ? products
        : products.filter((product) => product.categoryId === categoryId);
    setFilteredProducts(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter(
      (product) =>
        product.pluCode?.toLowerCase().includes(query.toLowerCase()) ||
        product.name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const key = product.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateCartItem = (id, action, size = null) => {
    setCart((prevCart) => {
      let updatedCart = [...prevCart];
      const itemIndex = updatedCart.findIndex((item) => item._id === id);

      if (itemIndex > -1) {
        const currentItem = updatedCart[itemIndex];

        if (action === "increment") {
          updatedCart[itemIndex] = { ...currentItem, quantity: currentItem.quantity + 1 };
        } else if (action === "decrement" && currentItem.quantity > 1) {
          updatedCart[itemIndex] = { ...currentItem, quantity: currentItem.quantity - 1 };
        } else if (size) {
          updatedCart[itemIndex] = { ...currentItem, size };
        }
      }

      return updatedCart;
    });
  };

  const removeFromCart = (_id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== _id));
  };

  return (
    <div className="slider h-screen-80px flex px-5 flex-col w-full overflow-auto">
      <div className="flex h-full justify-between gap-2 overflow-hidden">
        <div className="flex flex-col w-2/3 2xl:w-3/4 overflow-hidden">
          <SearchBar
            searchQuery={searchQuery}
            onSearch={handleSearch}
            products={products}
            onAddToCart={addToCart}
          />

          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
          />
          <p className="text-base font-bold py-2">
            {categories.find((cat) => cat.categoryId === selectedCategory)?.categoryName}
          </p>
          <ProductGrid groupedProducts={groupedProducts} onAddToCart={addToCart} />
        </div>
        <div className="flex flex-col w-1/3 2xl:w-1/4">
          <Cart
            cart={cart}
            updateCartItem={updateCartItem}
            removeFromCart={removeFromCart}
            sellingTypeId={selectedOption}
            setCart={setCart}
          />
        </div>
      </div>
    </div>
  );
};

export default POS;

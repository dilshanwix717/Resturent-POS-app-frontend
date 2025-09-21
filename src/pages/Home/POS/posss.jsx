import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowDropright, IoIosArrowDropleft, IoMdCloseCircle } from "react-icons/io";
import { MdAddToPhotos } from "react-icons/md";
import { FaPlusSquare , FaMinusSquare } from "react-icons/fa";
import { MainButton } from '../../../components/Button/Button';
import newRequest from '../../../utils/newRequest';
import PayOrderForm from '../../../components/Form/PayOrderForm';
import DiscountItemForm from '../../../components/Form/DiscountItemForm';
import DiscountTotalForm from '../../../components/Form/DiscountTotalForm';
import { toast } from 'react-toastify';

const POSss = ({ selectedOption }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [hoveredSizes, setHoveredSizes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all-items');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const sliderRef = useRef(null);
  const suggestionContainerRef = useRef(null);
  const [cart, setCart] = useState([]);
  const [sellingTypeAmount, setSellingTypeAmount] = useState(0);
  const [additionDeduction, setAdditionDeduction] = useState(0);
  const [showPayOrderForm, setShowPayOrderForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [isTotalDiscountFormOpen, setIsTotalDiscountFormOpen] = useState(false);
  const [Discount, setTotalDiscount] = useState(0);
  const [ServiceDelivery, setServiceDelivery] = useState('');
  const [sellingType, setSellingType] = useState('');
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(storedOrders);

    const storedBills = JSON.parse(localStorage.getItem('bills')) || [];
    setBills(storedBills);
  }, []);

  const handleHoldOrder = () => {
    const lastOrdersNumber = orders.length > 0 ? Math.max(...orders.map(order => order.ordersNumber)) : 0;
  
    const newOrdersNumber = lastOrdersNumber + 1;
    const newOrder = { ordersNumber: newOrdersNumber, items: cart };
  
    const updatedOrders = [...orders, newOrder];
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  
    setCart([]);
    setSelectedOrders(null);
  };

  const handleOrdersClick = (orders) => {
    setSelectedOrders(orders.ordersNumber);
    setCart(orders.items);
  };

  const handleDeleteOrders = (ordersNumber) => {
    const updatedOrders = orders.filter(orders => orders.ordersNumber !== ordersNumber);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    setSelectedOrders(null);
    setCart([]);
  };

  const clearLocalStorageAtMidnight = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const lastClearedDate = localStorage.getItem('lastClearedDate');
  
    if (currentDate !== lastClearedDate) {
      localStorage.removeItem('orders');
      localStorage.setItem('lastClearedDate', currentDate);
      console.log('Local storage cleared at midnight.');
    }
  };
  
  useEffect(() => {
    clearLocalStorageAtMidnight();
  
    const interval = setInterval(() => {
      clearLocalStorageAtMidnight();
    }, 60000);
  
    return () => clearInterval(interval);
  }, []);

  // Get current date
  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const now = new Date();
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${date} ${month} ${year}`;
  };

  // Function to format prices
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    const shopId = localStorage.getItem('shopId');

    // Get all sellingTypes
    newRequest.get('sellingTypes')
      .then(response => {
        const sellingTypes = response.data;
        const selectedSellingType = sellingTypes.find(type => type.sellingTypeId === selectedOption);

        if (selectedSellingType) {
          setServiceDelivery(selectedSellingType.ServiceDelivery);
          setSellingType(selectedSellingType.sellingType);
        } else {
          console.warn('Selling type not found for the selected option.');
        }
      })
      .catch(error => {
        console.error('Error fetching selling types:', error);
      });
  
    // Get all categories
    newRequest.get('categories')
      .then(response => {
        const allItemsCategory = { categoryName: 'All Items', categoryId: 'all-items' };
        
        const enabledCategories = response.data.filter(category => 
          category.toggle !== 'disable' && 
          category.categoryName !== 'Ingrediants' && 
          category.categoryName !== 'Raw Material' && 
          category.companyId === companyId // Filter by companyId
        );
        
        setCategories([allItemsCategory, ...enabledCategories]);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
    });

    const fetchSellingTypeAmount = async () => {
      if (cart.length > 0) {
        try {
          const response = await newRequest.get(`/sellingTypes/${selectedOption}`);
          const { sellingTypeAmount, additionDeduction } = response.data;

          // Set sellingTypeAmount
          setSellingTypeAmount(sellingTypeAmount);

          // Process additionDeduction
          const isPercentage = additionDeduction.endsWith('%');
          const parsedDeduction = parseFloat(additionDeduction.replace(/[^0-9.-]/g, ''));
          let totalAmount = calculateSubtotal() - calculateTotalDiscount();
          
          if (isPercentage) {
            setAdditionDeduction(totalAmount*(parsedDeduction / 100));
          } else {
            const isAddition = additionDeduction.startsWith('+');
            setAdditionDeduction(isAddition ? parsedDeduction : parsedDeduction);
          }
        } catch (error) {
          console.error('Error fetching selling type:', error);
        }
      } else {
        setSellingTypeAmount(0);
        setAdditionDeduction(0);
      }
    };

    fetchSellingTypeAmount();
  
    // Get all products
    newRequest.get('products')
      .then(response => {
        const filteredProducts = response.data.filter(product =>
          product.companyId === companyId &&
          product.activeShopIds.includes(shopId) &&
          product.productType.split(',').map(type => type.trim()).includes('Finished Good') &&
          product.toggle === 'enable'
        );

        const productPromises = filteredProducts.map(product =>
          newRequest.get(`prices/getFullPriceDetails/${companyId}/${shopId}/${product.productId}/${selectedOption}`)
            .then(res => {
              if (res.data.message === "Price not found") {
                return null;
              }
              return { ...product, priceDetails: res.data };
            })
            .catch(error => {
              // Handle 404 specifically
              if (error.response?.status === 404) {
                console.warn(`Price details not found for ProductID: ${product.productId}`);
                return null;
              }
              console.error('Error fetching price details:', error);
              return null;
            })
        );

        Promise.all(productPromises)
          .then(productsWithPriceDetails => {
            const validProducts = productsWithPriceDetails.filter(product => product !== null);
            setProducts(validProducts);
          })
          .catch(error => console.error('Error setting products:', error));
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
    }, [selectedOption, cart]);

  const defaultSizes = {
    Small: 'Small',
    Regular: 'Regular',
    Large: 'Large',
  };
  
  const getDefaultSize = (sizes) => {
    return sizes.find(size => defaultSizes[size]) || null;
  };
  
  // handle product card size click
  const handleSizeClick = (productName, size) => {
    const selectedProduct = groupedProducts[productName].find(p => p.size === size);
  
    if (selectedProduct) {
      if (!selectedProduct.priceDetails.stockDetails.productAvailability) {
        toast.error('This product is out of stock!');
        return;
      }
  
      // If product is in stock, update the cart
      setCart(prevCart => {
        const existingProduct = prevCart.find(item => item.size === size && item.name === productName);
        if (existingProduct) {
          return prevCart.map(item =>
            item.size === size && item.name === productName
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { ...selectedProduct, quantity: 1 }];
      });
    }
  };

  // handle change price when hover size
  const handleSizeMouseEnter = (productName, size) => {
    setHoveredSizes(prevHoveredSizes => ({
      ...prevHoveredSizes,
      [productName]: size,
    }));
  };

  const handleSizeMouseLeave = (productName) => {
    setHoveredSizes(prevHoveredSizes => ({
      ...prevHoveredSizes,
      [productName]: null,
    }));
  };

  
  const handleQuantityChange = (product, delta) => {
    const maxValue = product.priceDetails.stockDetails.numberOfProductsAvailable;

    setCart(prevCart => prevCart.map(item => {
      if (item === product) {
        const newQuantity = item.quantity + delta;
        return {
          ...item,
          quantity: Math.max(1, Math.min(newQuantity, maxValue))
        };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (product) => {
    setCart(prevCart => prevCart.filter(item => item !== product));
  };
  
  const applyDiscount = (cartItem, { amount, percentage }) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.productId === cartItem.productId) {
          return { ...item, discount: { amount, percentage } };
        }
        return item;
      });
    });
    setIsModalOpen(false);
  };  

  const calculateTotalPrice = (product) => {
    const discountValue = product.priceDetails?.price?.discount;
    let discount = null;
    let isPercentage = false;
  
    if (discountValue) {
      if (discountValue.includes('%')) {
        // It's a percentage discount
        discount = parseInt(discountValue.replace('%', ''));
        isPercentage = true;
      } else {
        // It's a fixed amount discount
        discount = parseFloat(discountValue);
        isPercentage = false;
      }
    }
  
    const sellingPrice = parseFloat(product.priceDetails?.price?.sellingPrice) || 0;
    const sellingTypeCommission = product.priceDetails?.price?.sellingTypeCommission || '';
  
    // Calculate the effective selling price based on the commission
    let effectiveSellingPrice = sellingPrice;
    if (sellingTypeCommission) {
      if (sellingTypeCommission.includes('%')) {
        const commissionPercentage = parseFloat(sellingTypeCommission.replace('%', ''));
        if (sellingTypeCommission.startsWith('+')) {
          effectiveSellingPrice += (sellingPrice * (commissionPercentage / 100));
        } else if (sellingTypeCommission.startsWith('-')) {
          effectiveSellingPrice -= (sellingPrice * (commissionPercentage / 100));
        }
      } else {
        const commissionValue = parseFloat(sellingTypeCommission.slice(1));
        if (sellingTypeCommission.startsWith('+')) {
          effectiveSellingPrice += commissionValue;
        } else if (sellingTypeCommission.startsWith('-')) {
          effectiveSellingPrice -= commissionValue;
        }
      }
    }
  
    // Calculate price after initial discount
    const initialDiscountedPrice = isPercentage
      ? effectiveSellingPrice - (effectiveSellingPrice * (discount / 100))
      : effectiveSellingPrice - discount;
  
    // Additional discount
    const additionalDiscountAmount = product.discount?.amount ? parseFloat(product.discount.amount) : null;
    const additionalDiscountPercentage = product.discount?.percentage ? parseInt(product.discount.percentage) : null;
  
    // Calculate price after additional discount
    let finalDiscountedPrice = initialDiscountedPrice;
    if (additionalDiscountAmount) {
      finalDiscountedPrice = initialDiscountedPrice - additionalDiscountAmount;
    } else if (additionalDiscountPercentage > 0) {
      finalDiscountedPrice = initialDiscountedPrice - (initialDiscountedPrice * (additionalDiscountPercentage / 100));
    }
  
    return (finalDiscountedPrice * product.quantity).toFixed(2);
  };  
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, product) => {
      const sellingPrice = parseFloat(product.priceDetails?.price?.sellingPrice) || 0;
      const sellingTypeCommission = product.priceDetails?.price?.sellingTypeCommission || '';

      // Calculate the effective selling price based on the commission
      let effectiveSellingPrice = sellingPrice;
      if (sellingTypeCommission) {
        if (sellingTypeCommission.includes('%')) {
          const commissionPercentage = parseFloat(sellingTypeCommission.replace('%', ''));
          if (sellingTypeCommission.startsWith('+')) {
            effectiveSellingPrice += (sellingPrice * (commissionPercentage / 100));
          } else if (sellingTypeCommission.startsWith('-')) {
            effectiveSellingPrice -= (sellingPrice * (commissionPercentage / 100));
          }
        } else {
          const commissionValue = parseFloat(sellingTypeCommission.slice(1));
          if (sellingTypeCommission.startsWith('+')) {
            effectiveSellingPrice += commissionValue;
          } else if (sellingTypeCommission.startsWith('-')) {
            effectiveSellingPrice -= commissionValue;
          }
        }
      }

      const productTotal = effectiveSellingPrice * product.quantity;
      return total + productTotal;
    }, 0).toFixed(2);
  };

  const handleAddTotalDiscount = () => {
    setIsTotalDiscountFormOpen(true);
  };

  // Apply a total discount to the total amount
  const applyTotalDiscount = ({ amount, percentage }) => {
    const total = parseFloat(calculateTotal());
  
    const totalDiscount = parseFloat(amount) + parseFloat((percentage / 100) * total);
  
    setTotalDiscount(totalDiscount);
    setIsTotalDiscountFormOpen(false);
  };

  const handleAddDiscountClick = (product) => {
    setSelectedCartItem(product);
    setIsModalOpen(true);
  };

  // Calculate total discount
  const calculateTotalDiscount = () => {
    return cart.reduce((totalDiscount, product) => {
      const sellingPrice = parseFloat(product.priceDetails?.price?.sellingPrice) || 0;
      const sellingTypeCommission = product.priceDetails?.price?.sellingTypeCommission || '';

      // Calculate the effective selling price based on the commission
      let effectiveSellingPrice = sellingPrice;
      if (sellingTypeCommission) {
        if (sellingTypeCommission.includes('%')) {
          const commissionPercentage = parseFloat(sellingTypeCommission.replace('%', ''));
          if (sellingTypeCommission.startsWith('+')) {
            effectiveSellingPrice += (sellingPrice * (commissionPercentage / 100));
          } else if (sellingTypeCommission.startsWith('-')) {
            effectiveSellingPrice -= (sellingPrice * (commissionPercentage / 100));
          }
        } else {
          const commissionValue = parseFloat(sellingTypeCommission.slice(1));
          if (sellingTypeCommission.startsWith('+')) {
            effectiveSellingPrice += commissionValue;
          } else if (sellingTypeCommission.startsWith('-')) {
            effectiveSellingPrice -= commissionValue;
          }
        }
      }

      // Initial discount from priceDetails
      const discountValue = product.priceDetails?.price?.discount || '';
      let initialDiscountAmount = 0;
      if (discountValue.includes('%')) {
        const initialDiscountPercentage = parseInt(discountValue.replace('%', ''));
        initialDiscountAmount = (effectiveSellingPrice * (initialDiscountPercentage / 100)) * product.quantity;
      } else {
        initialDiscountAmount = parseFloat(discountValue) * product.quantity;
      }

      // Additional discount
      const additionalDiscountAmount = product.discount?.amount ? parseFloat(product.discount.amount) : 0;
      const additionalDiscountPercentage = product.discount?.percentage ? parseInt(product.discount.percentage) : 0;

      let additionalDiscountAmountCalculated = 0;
      if (additionalDiscountAmount) {
        additionalDiscountAmountCalculated = additionalDiscountAmount * product.quantity;
      } else if (additionalDiscountPercentage > 0) {
        additionalDiscountAmountCalculated = (effectiveSellingPrice - initialDiscountAmount) * (additionalDiscountPercentage / 100) * product.quantity;
      }

      const totalDiscountAmount = initialDiscountAmount + additionalDiscountAmountCalculated;

      return totalDiscount + totalDiscountAmount;
    }, 0).toFixed(2);
  };

  const calculateServiceCharge = () => {
    let serviceCharge;
  
    // Calculate the total amount after discounts
    let totalAmount = calculateSubtotal() - calculateTotalDiscount();
  
    // Calculate the service charge based on sellingTypeAmount
    if (typeof sellingTypeAmount === 'string' && sellingTypeAmount.includes('%')) {
      const percentageValue = parseFloat(sellingTypeAmount) / 100;
      serviceCharge = totalAmount * percentageValue;
    } else {
      serviceCharge = parseFloat(sellingTypeAmount);
    }

  
    serviceCharge += additionDeduction
  
    return serviceCharge.toFixed(2);
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const totalDiscount = parseFloat(calculateTotalDiscount());
    const serviceCharge = parseFloat(calculateServiceCharge());
  
    const finalTotal = (subtotal - totalDiscount) + serviceCharge;
  
    return finalTotal.toFixed(2);
  };

  // Create manual slider for category
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 150;
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 150;
    }
  };

  // Function to extract the numeric part of the product ID
  const extractNumericPart = (productId) => {
    const match = productId.match(/\d+/);
    return match ? match[0] : '';
  };

  // Filter products by selected category and search input
const filteredProducts = products
.filter(product => selectedCategory === 'all-items' || product.categoryId === selectedCategory)
.filter(product => 
  product.name.toLowerCase().includes(searchInput.toLowerCase()) ||
  //extractNumericPart(product.productId).includes(searchInput) ||
  product.pluCode.includes(searchInput)
);

// Group products by name
const groupedProducts = filteredProducts.reduce((acc, product) => {
if (!acc[product.name]) {
  acc[product.name] = [];
}
acc[product.name].push(product);
return acc;
}, {});

// Automatically select the default size for a product if available
const getProductWithDefaultSize = (product) => {
const defaultSize = getDefaultSize(product.map(p => p.size));
return defaultSize ? product.find(p => p.size === defaultSize) : null;
};

// Use `getProductWithDefaultSize` to determine which size to select by default when displaying
const defaultSizeProducts = Object.keys(groupedProducts).reduce((acc, productName) => {
const products = groupedProducts[productName];
const productWithDefaultSize = getProductWithDefaultSize(products);
if (productWithDefaultSize) {
  acc[productName] = productWithDefaultSize.size;
}
return acc;
}, {});

  // Update suggestions based on search input
  useEffect(() => {
    if (searchInput) {
      const newSuggestions = products.filter(product =>
        product.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        product.pluCode.includes(searchInput)
      );
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
  
      // If only one product matches, set it as the selected product automatically
      if (newSuggestions.length === 1) {
        setSelectedProduct(newSuggestions[0]);
      } else {
        setSelectedProduct(null); // Reset if multiple or no products match
      }
    } else {
      setShowSuggestions(false);
      setSelectedProduct(null); // Reset when input is cleared
    }
  }, [searchInput, products]);
  
  
  const handleSuggestionClick = (product) => {
    if (!product.priceDetails.stockDetails.productAvailability) {
      toast.error('This product is out of stock!');
      return;
    }
  
    const foundProduct = cart.find(item => item.productId === product.productId);
  
    if (foundProduct) {
      // Update the quantity if product is already in the cart
      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === foundProduct.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add the product if it's not already in the cart
      setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
    }
  
    setSearchInput('');
    setShowSuggestions(false);
  };
  

  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddToCart = () => {
    if (suggestions.length === 1) {
      const product = suggestions[0];
      
      // Check if the product is out of stock
      if (!product.priceDetails.stockDetails.productAvailability) {
        toast.error('This product is out of stock!');
        return;
      }
  
      const foundProduct = cart.find(item => item.productId === product.productId);
  
      if (foundProduct) {
        // Update the quantity of the existing product
        setCart(prevCart =>
          prevCart.map(item =>
            item.productId === foundProduct.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        // Add the product if it's not already in the cart
        setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
      }
  
      setSearchInput('');
      setShowSuggestions(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && suggestions.length === 1) {
      const product = suggestions[0];
  
      // Check if the product is out of stock
      if (!product.priceDetails.stockDetails.productAvailability) {
        toast.error('This product is out of stock!');
        return;
      }
  
      const foundProduct = cart.find(item => item.productId === product.productId);
  
      if (foundProduct) {
        // Update the quantity of the existing product
        setCart(prevCart =>
          prevCart.map(item =>
            item.productId === foundProduct.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        // Add the product if it's not already in the cart
        setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
      }
  
      setSearchInput('');
      setShowSuggestions(false);
    }
  };
    

  const handleClickOutside = (event) => {
    if (suggestionContainerRef.current && !suggestionContainerRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handles the pay order
  const handlePayOrder = () => {
    setCart([]);
    const lastBillNumber = bills.length > 0 ? Math.max(...bills.map(bill => bill.billNumber)) : 0;

    const newBillNumber = lastBillNumber + 1;
    const newBill = { billNumber: newBillNumber, items: cart, paid: true };

    const updatedBills = [...bills, newBill];
    localStorage.setItem('bills', JSON.stringify(updatedBills));
    setBills(updatedBills);

    if (selectedOrders !== null) {
      const remainingOrders = orders.filter(order => order.ordersNumber !== selectedOrders);
      localStorage.setItem('orders', JSON.stringify(remainingOrders));
      setOrders(remainingOrders);
    }

    setCart([]);
    setSelectedOrders(null);
    setShowPayOrderForm(false);
  };

  const handleNewCart = () => {
    const newOrdersNumber = orders.length + 1;
    setSelectedOrders(newOrdersNumber);
    setCart([]);
  };

  const handleReturn = () => {
    navigate('/receipts');
  };

  return (
    <div className='slider h-screen-80px flex px-5 flex-col w-full overflow-auto'>
      <div className='flex justify-between pb-3'>
        <div className='flex w-1/2 relative' ref={suggestionContainerRef}>
          <input
            type="text"
            className="block w-full rounded-l-md border-2 border-secondary text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight"
            id="text"
            placeholder='Search Product Name/ ID'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {showSuggestions && searchInput && (
            <ul className="absolute w-full mt-10 bg-white rounded-md shadow-lg z-10">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div>{item.name} - {item.pluCode} ( {item.size} )</div>
                  <div className="text-xs text-gray-500">{item.price}</div>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleAddToCart}
            className='bg-secondary text-white text-nowrap font-medium px-4 text-xs rounded-r-md xl:text-sm hover:shadow-lg transition duration-300'
          >
            Add
          </button>

        </div>
      </div>

      <div className='flex h-full justify-between gap-2 overflow-hidden'>
        <div className='flex flex-col w-2/3 2xl:w-3/4 overflow-hidden'>
          <div className='relative bg-primary bg-opacity-75 flex gap-2 rounded-md p-2'>
            <button onClick={scrollLeft} className="absolute left-0 top-0 bg-primary text-black px-2 h-full rounded"><IoIosArrowDropleft /></button>
            <div ref={sliderRef} className='flex gap-1 p-2 px-6 overflow-x-auto slider'>
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`flex flex-col h-full gap-1 xl:gap-3 text-nowrap items-center bg-secondary bg-opacity-50 py-2 px-5 rounded-xl border-2 cursor-pointer ${selectedCategory === category.categoryId ? 'bg-opacity-100' : 'bg-opacity-50 border-secondary'}`}
                  onClick={() => setSelectedCategory(category.categoryId)}
                >
                  <p className='font-medium text-xs 2xl:text-sm text-white'>{category.categoryName}</p>
                </div>
              ))}
            </div>
            <button onClick={scrollRight} className="absolute right-0 top-0 bg-primary text-black px-2 h-full rounded"><IoIosArrowDropright /></button>
          </div>

          <p className='text-base font-bold py-2'>{categories.find(cat => cat.categoryId === selectedCategory)?.categoryName}</p>

          

          <div className='slider grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 text-xs xl:text-sm overflow-auto'>
            {Object.entries(groupedProducts).map(([name, products]) => {
              const sizes = products.map(p => p.size);
              const defaultSize = getDefaultSize(sizes);
              const selectedSize = selectedSizes[name] || defaultSize;
              const hoveredSize = hoveredSizes[name];
              const activeSize = hoveredSize || selectedSize;

              const activeProduct = products.find(p => p.size === activeSize);

              const discountValue = activeProduct?.priceDetails?.price?.discount;
              let discount = null;
              let isPercentage = false;

              if (discountValue) {
                if (discountValue.includes('%')) {
                  discount = parseInt(discountValue.replace('%', ''));
                  isPercentage = true;
                } else {
                  discount = parseFloat(discountValue);
                  isPercentage = false;
                }
              }

              const sellingPrice = parseFloat(activeProduct?.priceDetails?.price?.sellingPrice) || 0;
              const sellingTypeCommission = activeProduct?.priceDetails?.price?.sellingTypeCommission || '';

              // Calculate the effective selling price based on the commission
              let effectiveSellingPrice = sellingPrice;
              if (sellingTypeCommission) {
                if (sellingTypeCommission.includes('%')) {
                  const commissionPercentage = parseFloat(sellingTypeCommission.replace('%', ''));
                  if (sellingTypeCommission.startsWith('+')) {
                    effectiveSellingPrice += (sellingPrice * (commissionPercentage / 100));
                  } else if (sellingTypeCommission.startsWith('-')) {
                    effectiveSellingPrice -= (sellingPrice * (commissionPercentage / 100));
                  }
                } else {
                  const commissionValue = parseFloat(sellingTypeCommission.slice(1));
                  if (sellingTypeCommission.startsWith('+')) {
                    effectiveSellingPrice += commissionValue;
                  } else if (sellingTypeCommission.startsWith('-')) {
                    effectiveSellingPrice -= commissionValue;
                  }
                }
              }

              // Calculate discounted price based on discount type
              const discountedPrice = isPercentage
                ? (effectiveSellingPrice - (effectiveSellingPrice * (discount / 100))).toFixed(2)
                : (effectiveSellingPrice - discount).toFixed(2);

              return (
                <div
                  key={name}
                  className='relative flex flex-col h-auto gap-1 items-center p-2 bg-white border-2 hover:border-secondary rounded-lg text-center justify-between cursor-pointer'
                >
                  <div className='h-full flex flex-col gap-1 pt-3 items-center justify-between'>
                    <p className='font-bold'>{name}</p>
                    <div>
                      {activeProduct && (
                        <>
                          {discount > 0 ? (
                            <>
                              <p className='font-bold'>{formatPrice(discountedPrice)}</p>
                              <p className='font-semibold line-through'>{formatPrice(effectiveSellingPrice)}</p>
                            </>
                          ) : (
                            <p className='font-bold'>{formatPrice(effectiveSellingPrice)}</p>
                          )}
                        </>
                      )}
                    </div>
                    {discount > 0 && (
                      <p className='absolute top-1 right-1 bg-merunRed text-white p-1 rounded-full font-semibold'>
                        {discountValue}
                      </p>
                    )}
                    <div className='flex gap-1'>
                      {['Small', 'Regular', 'Large'].map(size => {
                        const product = products.find(p => p.size === size);
                        if (product) {
                          return (
                            <div
                              key={size}
                              className={`w-5 h-5 rounded-md font-medium flex items-center justify-center cursor-pointer ${activeSize === size ? 'bg-secondary' : 'bg-primary hover:bg-secondary'}`}
                              onClick={() => handleSizeClick(name, size)}
                              onMouseEnter={() => handleSizeMouseEnter(name, size)}
                              onMouseLeave={() => handleSizeMouseLeave(name)}
                            >
                              {size === 'Large' ? 'L' : size === 'Small' ? 'S' : 'R'}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    {!activeProduct?.priceDetails.stockDetails.productAvailability ? (
                      <p className='text-red-600 font-bold'>Out of Stock</p>
                    ) : (
                      <p className='text-green-600 font-bold'></p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='flex flex-col w-1/3 2xl:w-1/4'>
          <div className='flex'>
            <div className='flex items-center pr-1 pb-1'>
              <MdAddToPhotos className='text-merunRed cursor-pointer' onClick={handleNewCart} />
            </div>
            <div className='flex w-ful slider overflow-x-auto'>
              <div className='flex justify-end gap-1 pb-1'>
                {orders.filter(orders => !orders.paid).map((orders, index) => (
                  <p
                    key={index}
                    className={`px-2 py-1 bg-merunRed rounded-md text-white text-xs xl:text-sm font-medium cursor-pointer ${selectedOrders === orders.ordersNumber ? 'bg-opacity-75' : ''}`}
                    onClick={() => handleOrdersClick(orders)}
                  >
                    #{orders.ordersNumber}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className='bill-section  h-full flex flex-col text-xs xl:text-sm overflow-hidden'>
            <div className='h-full flex flex-col bg-white p-2 pb-0 overflow-hidden'>
              <div className='relative flex flex-col items-center gap-1 bg-white rounded-t-md'>
                <div className='w-full flex justify-end'>
                  <IoMdCloseCircle className='text-red-500 cursor-pointer' onClick={() => handleDeleteOrders(selectedOrders)} />
                </div>
                <div className='w-full flex font-bold justify-between'>
                  <p>New Order Bill</p>
                  <p>{getCurrentDate()}</p>
                </div>
              </div>

              <div className='slider h-full flex flex-col gap-1 justify-start py-1 overflow-auto'>
                {cart.map((product, index) => (
                  <div key={index} className='cart-card flex justify-between bg-primary bg-opacity-35 border-2 rounded-md p-1'>
                    <div className='w-full flex flex-col gap-1'>
                      <div className='flex justify-between'>
                        <p className='w-full font-semibold'>{product.name}</p>
                        <p className='w-28 text-end font-semibold'>{formatPrice(calculateTotalPrice(product))}</p>
                      </div>
                      <div className='flex justify-between'>
                        <div className='flex items-center gap-1'>
                          <FaMinusSquare
                            className='text-sm text-secondary flex items-center justify-center cursor-pointer'
                            onClick={() => handleQuantityChange(product, -1)}
                          />
                          <p className='font-medium'>{product.quantity}</p>
                          <FaPlusSquare
                            className='text-sm text-secondary flex items-center justify-center cursor-pointer'
                            onClick={() => handleQuantityChange(product, 1)}
                          />
                        </div>
                        <div>
                          <p className='bg-secondary w-4 h-4 font-medium xl:w-5 xl:h-5 rounded-full flex items-center justify-center cursor-pointer'>
                            {product.size[0].toUpperCase()}
                          </p>
                        </div>
                        <button
                          className='text-tColor opacity-75 border px-2 rounded-full cursor-pointer hover:bg-primary transition duration-300'
                          onClick={() => handleAddDiscountClick(product)}
                        >
                          Add Discount
                        </button>
                      </div>
                    </div>
                    <div className='flex w-5 items-center justify-center'>
                      <IoMdCloseCircle className='text-red-500 cursor-pointer' onClick={() => handleRemoveFromCart(product)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-1 font-medium bg-white p-2 pb-0 rounded-b-md'>
              <div className='flex justify-between'>
                <p className='w-full'>Sub Total </p>
                <p className='w-28 text-end'>{formatPrice(calculateSubtotal())}</p>
              </div>

              <div className='flex justify-between'>
                <div className='flex gap-1'>
                  <p>Discount</p>
                  {/*<button className='text-tColor opacity-75 border px-2 rounded-full cursor-pointer hover:bg-primary transition duration-300' onClick={handleAddTotalDiscount}>Add Discount</button>*/}
                </div>
                <p className='w-28 text-end'>{formatPrice(calculateTotalDiscount())}</p>
              </div>

              {ServiceDelivery === 'Delivery' ? (
                <div className='flex justify-between'>
                  <p className='w-full'>Delivery Charges</p>
                  <p className='w-28 text-end'>{formatPrice(calculateServiceCharge())}</p>
                </div>
              ) : (
                <div className='flex justify-between'>
                  <p className='w-full'>Service Charges</p>
                  <p className='w-28 text-end'>{formatPrice(calculateServiceCharge())}</p>
                </div>
              )}

              <hr className='w-full border-1 border-black' />

              <div className='flex font-medium justify-between text-secondary'>
                <p className='w-full'>Total</p>
                <p className='w-28 text-end'>{formatPrice(calculateTotal())}</p>
              </div>

              <MainButton text='Pay Order'  onClick={() => setShowPayOrderForm(true)}/>

              <hr className='w-full border-1 border-black' />

              <div className='flex justify-between'>
                <MainButton text='Hold Order' bgColor='bg-merunRed' onClick={handleHoldOrder}/>
                <MainButton text='Return Order' bgColor='bg-merunRed' onClick={handleReturn}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DiscountTotalForm
        isOpen={isTotalDiscountFormOpen}
        onClose={() => setIsTotalDiscountFormOpen(false)}
        onSave={applyTotalDiscount}
      />
      <DiscountItemForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={applyDiscount}
        cartItem={selectedCartItem}
      />
      {showPayOrderForm && (
        <PayOrderForm
          totalAmount={calculateTotal()}
          discount={calculateTotalDiscount()}
          subTotal={calculateSubtotal()}
          serviceCharges={calculateServiceCharge()}
          sellingTypeId={selectedOption}
          sellingType={sellingType}
          cartItems={cart}
          onClose={() => setShowPayOrderForm(false)}
          onPayOrder={handlePayOrder}
          orders={orders}
          billNumber={bills.length + 1}
          orderNumber={selectedOrders}
        />
      )}
    </div>
  );
};

export default POSss;

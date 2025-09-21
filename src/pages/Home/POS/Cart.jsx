import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaPlusSquare, FaMinusSquare } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { MdAddToPhotos } from "react-icons/md";
import { MainButton } from "../../../components/Button/Button";
import { fetchSellingTypes } from "../../../api/apiService";
import { toast } from 'react-toastify';
import DiscountItemForm from '../../../components/Form/DiscountItemForm';
import PayOrderForm from '../../../components/Form/PayOrderForm';
import ServiceChargeForm from "../../../components/Form/ServiceChargeForm";

const Cart = ({ cart, updateCartItem, removeFromCart, sellingTypeId, setCart }) => {
  const [sellingTypeData, setSellingTypeData] = useState(null);
  const [savedOrders, setSavedOrders] = useState([]);
  const [orderNumber, setOrderNumber] = useState(1);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [showPayOrderForm, setShowPayOrderForm] = useState(false);
  const [isServiceChargeDialogOpen, setIsServiceChargeDialogOpen] = useState(false);
  const [serviceCharge, setServiceCharge] = useState('10%');
  const navigate = useNavigate();

  const [serviceChargeData, setServiceChargeData] = useState({
    amount: null,
    percentage: 10,
    serviceChargeAuthorizedBy: null,
    serviceChargeAuthorizedByName: null
  });

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    setSavedOrders(orders);
  }, []);

  useEffect(() => {
    const savedOrderNumber = localStorage.getItem('orderNumber');
    if (savedOrderNumber) {
      setOrderNumber(parseInt(savedOrderNumber, 10));
    } else {
      localStorage.setItem('orderNumber', '1');
    }
  }, []);

  useEffect(() => {
    if (serviceChargeData.amount > 0) {
      setServiceCharge(serviceChargeData.amount);
    } else if (serviceChargeData.percentage > 0) {
      setServiceCharge(serviceChargeData.percentage + '%');
    }
  }, [serviceChargeData])

  const holdOrder = () => {
    if (cart.length === 0) return toast.error("Cart is empty!");

    const newOrder = [...cart];
    const updatedOrders = [...savedOrders, newOrder];

    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setSavedOrders(updatedOrders);
    setCart([]);
  };

  const loadOrder = (index) => {
    const orders = JSON.parse(localStorage.getItem("orders"));
    if (orders && orders[index]) {
      setSelectedOrderIndex(index);
      setCart(orders[index]);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSellingTypes();
      const selectedSellingType = data.find(type => type.sellingTypeId === sellingTypeId);
      setSellingTypeData(selectedSellingType);
    };
    fetchData();
  }, [sellingTypeId]);

  const getSizeAbbreviation = (size) => {
    switch (size.toLowerCase()) {
      case "regular":
      case "medium":
        return "R";
      case "large":
        return "L";
      case "small":
        return "S";
      default:
        return size;
    }
  };

  const applyDiscount = (cartItem, { amount, percentage, discountAuthorizedBy, discountAuthorizedByName }) => {
    const originalPrice = (cartItem.sellingPrice + parseFloat(cartItem.sellingTypeCommission));

    let customDiscountAmount = 0;

    if (percentage) {
      customDiscountAmount = originalPrice * (parseFloat(percentage) / 100);
    } else if (amount) {
      customDiscountAmount = parseFloat(amount);
    }

    // Update the cart item with all discount information
    cartItem.customDiscount = customDiscountAmount;
    cartItem.discountAuthorizedBy = discountAuthorizedBy || null;
    cartItem.discountAuthorizedByName = discountAuthorizedByName || null;

    const totalDiscount = calculateDiscount(cartItem) + customDiscountAmount;
    cartItem.finalPrice = originalPrice - customDiscountAmount;

    updateCartItem(cartItem.id, cartItem);
    console.log('Updated cart item with discount:', cartItem);
    setIsModalOpen(false);
  };

  const calculateDiscount = (cartItem) => {
    let discount = 0;
    if (cartItem.discountDateRange) {
      const [fromDate, toDate] = cartItem.discountDateRange
        .replace('From:', '')
        .replace('to:', '')
        .split(' ')
        .map(date => new Date(date.trim()));

      const currentDate = new Date();

      if (currentDate < fromDate || currentDate > toDate) {
        return discount;
      }
    }

    if (cartItem.discount.includes('%')) {
      let percentage = parseFloat(cartItem.discount.replace('%', '')) / 100;
      discount = percentage * (cartItem.sellingPrice + parseFloat(cartItem.sellingTypeCommission)) * cartItem.quantity;
    } else {
      discount = parseFloat(cartItem.discount) * cartItem.quantity;
    }

    return discount;
  };

  const totalDiscount = cart.reduce((acc, item) => {
    let discount = calculateDiscount(item);

    if (item.customDiscount) {
      discount += parseFloat(item.customDiscount) * item.quantity;;
    }

    return acc + discount;
  }, 0);


  // const calculateServiceCharge = () => {
  //   const additionDeductionValue = parseFloat(sellingTypeData?.additionDeduction.replace(/[^\d.-]/g, '')) || 0;
  //   const serviceCharge = (sellingTypeData?.sellingTypeAmount || 0) + additionDeductionValue;
  //   return serviceCharge;
  // };

  const applyServiceCharge = ({ amount, percentage, serviceChargeAuthorizedBy, serviceChargeAuthorizedByName }) => {
    console.log('Service charge details:', amount, percentage, serviceChargeAuthorizedBy, serviceChargeAuthorizedByName);

    setServiceChargeData({
      amount: amount || 0,
      percentage: percentage || 0,
      serviceChargeAuthorizedBy: serviceChargeAuthorizedBy || null,
      serviceChargeAuthorizedByName: serviceChargeAuthorizedByName || null
    });
  };

  const calculateServiceCharge = () => {

  };


  const calculateServiceChargeAmount = () => {
    let serviceChargeAmount = 0;

    if (serviceChargeData.percentage > 0) {
      serviceChargeAmount = subTotal * (serviceChargeData.percentage / 100);
    } else if (serviceChargeData.amount > 0) {
      serviceChargeAmount = serviceChargeData.amount;
    }

    return serviceChargeAmount;
  };

  // Update the calculateTotal function to use the new service charge calculation
  const calculateTotal = () => {
    const subTotal = cart.reduce(
      (acc, item) => acc + (item.sellingPrice + parseFloat(item.sellingTypeCommission)) * item.quantity,
      0
    );

    const serviceChargeAmount = calculateServiceChargeAmount();

    return subTotal + serviceChargeAmount - totalDiscount;
  };

  const subTotal = cart.reduce(
    (acc, item) => acc + (item.sellingPrice + parseFloat(item.sellingTypeCommission)) * item.quantity,
    0
  );

  const removeOrder = (index) => {
    const updatedOrders = savedOrders.filter((_, i) => i !== index);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setSavedOrders(updatedOrders);
    if (selectedOrderIndex === index) {
      setSelectedOrderIndex(null);
    }
    setCart([]);
  };

  const handleAddDiscountClick = (product) => {
    setSelectedCartItem(product);
    setIsModalOpen(true);
  };

  const handlePayOrder = () => {
    const nextOrderNumber = orderNumber + 1;
    setOrderNumber(nextOrderNumber);
    localStorage.setItem('orderNumber', nextOrderNumber.toString());

    if (selectedOrderIndex !== null) {
      const updatedOrders = savedOrders.filter((_, i) => i !== selectedOrderIndex);
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      setSavedOrders(updatedOrders);
      setSelectedOrderIndex(null);
    }

    setShowPayOrderForm(false);
    setCart([]);
  };

  const handleReturn = () => {
    navigate('/receipts');
  };


  return (
    <div className="bill-section h-full flex flex-col text-xs xl:text-sm overflow-hidden">
      <div className="h-full flex flex-col bg-white p-2 pb-0 overflow-hidden">
        <div className="flex">
          <div className="flex items-center pr-1 pb-1">
            <MdAddToPhotos
              className="text-merunRed cursor-pointer"
              onClick={() => {
                setSelectedOrderIndex(null);
                setCart([]);
              }}
            />
          </div>
          <div className="flex w-full slider overflow-x-auto">
            <div className="flex justify-end gap-1 pb-1">
              {savedOrders.map((_, index) => (
                <div
                  key={index}
                  className={`px-2 py-1 rounded-md text-white text-xs xl:text-sm font-medium cursor-pointer ${selectedOrderIndex === index ? "bg-secondary" : "bg-merunRed"
                    }`}
                  onClick={() => loadOrder(index)}
                >
                  #{index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-1 bg-white rounded-t-md">
          <div className="w-full flex justify-end">
            <IoMdCloseCircle className="text-red-500 cursor-pointer" onClick={() => removeOrder(selectedOrderIndex)} />
          </div>
          <div className="w-full flex font-bold justify-between">
            <p>New Order Bill</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="slider h-full flex flex-col gap-1 justify-start py-1 overflow-auto">
          {cart.map((item) => (
            <div
              key={item.id}
              className="cart-card flex justify-between bg-primary bg-opacity-35 border-2 rounded-md p-1"
            >
              <div className="w-full flex flex-col gap-1">
                <div className="flex justify-between">
                  <p className="w-full font-semibold">{item.name}</p>
                  <p className="w-28 text-end font-semibold">
                    {formatPrice(item.finalPrice)}
                  </p>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <FaMinusSquare
                      className="text-sm text-secondary cursor-pointer"
                      onClick={() =>
                        updateCartItem(item._id, "decrement")
                      }
                    />
                    <p className="font-medium">{item.quantity}</p>
                    <FaPlusSquare
                      className="text-sm text-secondary cursor-pointer"
                      onClick={() =>
                        updateCartItem(item._id, "increment")
                      }
                    />
                  </div>
                  <div>
                    <p
                      className="bg-secondary w-4 h-4 font-medium xl:w-5 xl:h-5 rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() =>
                        updateCartItem(
                          item.id,
                          null,
                          item.size === "S" ? "L" : "S"
                        )
                      }
                    >
                      {getSizeAbbreviation(item.size)}
                    </p>
                  </div>
                  <button
                    className="text-tColor opacity-75 border px-2 rounded-full cursor-pointer hover:bg-primary transition duration-300"
                    onClick={() => handleAddDiscountClick(item)}
                  >
                    Add Discount
                  </button>
                </div>
              </div>
              <div className="flex w-5 items-center justify-center">
                <IoMdCloseCircle
                  className="text-red-500 cursor-pointer"
                  onClick={() => removeFromCart(item._id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 font-medium bg-white p-2 pb-0 rounded-b-md">
        <div className="flex justify-between">
          <p className="w-full">Sub Total</p>
          <p className="w-28 text-end">{formatPrice(subTotal)}</p>
        </div>

        <div className="flex justify-between">
          <p className="w-full">Discount</p>
          <p className="w-28 text-end">{formatPrice(totalDiscount)}</p>
        </div>

        {sellingTypeData?.ServiceDelivery === "Delivery" ? (
          <div className="flex justify-between">
            <p className="w-full">Delivery Charges</p>
            <p className="w-28 text-end">{serviceCharge}</p>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <FaPlusSquare
              className="text-sm text-secondary cursor-pointer me-2"
              onClick={() =>
                setIsServiceChargeDialogOpen(true)
              }
            />
            <p className="w-full">Service Charges</p>
            <p className="w-28 text-end">{serviceCharge}</p>
          </div>
        )}

        <hr className="w-full border-1 border-black" />

        <div className="flex font-medium justify-between text-secondary">
          <p className="w-full">Total</p>
          <p className="w-28 text-end">{formatPrice(calculateTotal())}</p>
        </div>

        <MainButton text='Pay Order' onClick={() => setShowPayOrderForm(true)} />
        <hr className="w-full border-1 border-black" />
        <div className="flex justify-between">
          <MainButton text="Hold Order" bgColor="bg-merunRed" onClick={holdOrder} />
          <MainButton text="Return Order" bgColor="bg-merunRed" onClick={handleReturn} />
        </div>
      </div>
      <DiscountItemForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={applyDiscount}
        cartItem={selectedCartItem}
      />
      <ServiceChargeForm
        isOpen={isServiceChargeDialogOpen}
        onClose={() => setIsServiceChargeDialogOpen(false)}
        onSave={applyServiceCharge}
        serviceChargeData={serviceChargeData}
      />
      {showPayOrderForm && (
        <PayOrderForm
          orderNumber={orderNumber}
          cartItems={cart}
          totalAmount={formatPrice(calculateTotal())}
          discount={formatPrice(totalDiscount)}
          subTotal={formatPrice(subTotal)}
          serviceCharges={serviceCharge}
          sellingTypeId={sellingTypeId}
          onClose={() => setShowPayOrderForm(false)}
          onPayOrder={handlePayOrder}
          billNumber={orderNumber}
          serviceChargeAuthorizedBy={serviceChargeData.serviceChargeAuthorizedBy}
        />
      )}
    </div>
  );
};

export default Cart;

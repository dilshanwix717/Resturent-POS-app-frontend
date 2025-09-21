import React, { useState, useEffect } from 'react';
import newRequest from '../../utils/newRequest';
import { MainButton } from '../Button/Button';
import { IoMdCloseCircle } from "react-icons/io";
import { toast } from 'react-toastify';

const ReturnForm = ({ isOpen, onClose, transactionCode }) => {
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [total, setTotal] = useState(0);
  const [productNames, setProductNames] = useState({});
  const [productSize, setProductSize] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [returnTotal, setReturnTotal] = useState(0);

  useEffect(() => {
    if (isOpen) {
      newRequest.get(`/orders/${transactionCode}`)
        .then(response => {
          const order = response.data;
          setTotal(order.billTotal);
          setFinishedGoods(order.finishedGoods || []);
          const productPromises = order.finishedGoods.map(good =>
            newRequest.get(`/products/${good.finishedgoodId}`)
          );
          Promise.all(productPromises)
            .then(responses => {
              const name = {};
              const size = {};
              responses.forEach((res, index) => {
                const productId = order.finishedGoods[index].finishedgoodId;
                name[productId] = res.data.name;
                size[productId] = res.data.size;
              });
              setProductNames(name);
              setProductSize(size);
            })
            .catch(error => console.error('Error fetching product details:', error));
        })
        .catch(error => console.error('Error fetching order:', error));
    }
  }, [isOpen, transactionCode]);

  useEffect(() => {
    const calculateReturnTotal = () => {
      const total = Object.values(selectedItems).reduce((acc, item) => {
        const good = finishedGoods.find(good => good.finishedgoodId === item.productId);
        if (good) {
          const itemPrice = (good.sellingPrice - good.discountAmount) * item.quantity;
          return acc + itemPrice;
        }
        return acc;
      }, 0);
      setReturnTotal(total);
    };
    calculateReturnTotal();
  }, [selectedItems, finishedGoods]);

  const handleSelectItem = (productId, isChecked, condition, quantity, maxQuantity) => {
    setSelectedItems(prev => {
      const updatedItems = { ...prev };
      if (isChecked) {
        updatedItems[productId] = {
          productId,
          quantity: quantity || 1,
          maxQuantity,
          condition: condition || 'Good'
        };
      } else {
        delete updatedItems[productId];
      }
      return updatedItems;
    });
  };

  const handleQuantityChange = (productId, quantity, maxQuantity) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: Math.max(0, Math.min(quantity, maxQuantity))
      }
    }));
  };

  const handleConditionChange = (productId, condition) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        condition
      }
    }));
  };

  const handleSubmitReturnOrder = () => {
    const itemsToReturn = Object.values(selectedItems).map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      condition: item.condition
    }));

    const returnOrderBody = {
      transactionCode,
      itemsToReturn
    };

    newRequest.post('/orders/return-order', returnOrderBody)
      .then(() => {
        toast.success('Return order submitted successfully!');
        onClose();
      })
      .catch(error => {
        toast.error('Error submitting return order. Please try again.');
        console.error('Error submitting return order:', error);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-md w-2/3 xl:w-1/2 h-5/6 m-10 flex flex-col overflow-hidden">
        <div className="flex justify-between py-2 px-4 items-center text-tColor bg-primary sticky top-0 z-10">
          <h2 className="font-bold">Return Order</h2>
          <IoMdCloseCircle className="cursor-pointer text-lg" onClick={onClose} />
        </div>
        <div className="slider overflow-y-auto flex-grow p-4">
          <ul className="list-disc">
            {finishedGoods.map((good, index) => (
              <li key={index} className="mb-2 grid grid-cols-6 border py-1 items-center">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleSelectItem(
                      good.finishedgoodId,
                      e.target.checked,
                      selectedItems[good.finishedgoodId]?.condition,
                      selectedItems[good.finishedgoodId]?.quantity,
                      good.finishedgoodQty
                    )
                  }
                />
                <div className='col-span-3'>
                  <p><strong>Product Name:</strong> {productNames[good.finishedgoodId] || 'Loading...'}</p>
                  <p><strong>Quantity Available:</strong> {good.finishedgoodQty}</p>
                  <p><strong>Size:</strong> {productSize[good.finishedgoodId] || 'Loading...'}</p>
                  <p><strong>Price:</strong> Rs. {(good.sellingPrice - good.discountAmount).toFixed(2)}</p>
                </div>
                <div className='flex gap-2 col-span-2'>
                  <input
                    type="number"
                    min="0"
                    max={good.finishedgoodQty}
                    value={selectedItems[good.finishedgoodId]?.quantity || 0}
                    onChange={(e) => handleQuantityChange(good.finishedgoodId, parseInt(e.target.value), good.finishedgoodQty)}
                    className="block w-14 text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
                  />
                  <input
                    type="text"
                    placeholder="Condition (Good/Damaged)"
                    value={selectedItems[good.finishedgoodId]?.condition || ''}
                    onChange={(e) => handleConditionChange(good.finishedgoodId, e.target.value)}
                    className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between py-2 px-4 items-center bg-primary sticky bottom-0 z-10">
          <h2 className="font-bold">Bill Total: Rs.{total.toFixed(2)}</h2>
          <h2 className="font-bold">Return Total: Rs.{returnTotal.toFixed(2)}</h2>
          <MainButton text='Return' onClick={handleSubmitReturnOrder} />
        </div>
      </div>
    </div>
  );
};

export default ReturnForm;

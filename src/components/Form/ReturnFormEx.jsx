import React, { useState } from 'react';
import { MainButton } from '../Button/Button';
import { IoMdCloseCircle } from "react-icons/io";
import ordersData from '../../constants/orders.json';

const ReturnForm = ({ onClose, onSubmit, receiptId }) => {
  const formatPrice = (price) => {
    const numberPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberPrice);
  };

  const [selectedOrders, setSelectedOrders] = useState([]);

  const handleOrderSelect = (order) => {
    if (selectedOrders.includes(order)) {
      setSelectedOrders(selectedOrders.filter(item => item !== order));
    } else {
      setSelectedOrders([...selectedOrders, order]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-md w-3/4 xl:w-1/2 overflow-hidden">
        <div className="flex justify-between py-2 px-4 items-center text-tColor bg-primary">
          <h2 className="font-bold">{receiptId} Return Orders</h2>
          <IoMdCloseCircle className="cursor-pointer text-lg" onClick={onClose} />
        </div>
        <div className="flex flex-col gap-2 w-full h-full p-5 overflow-hidden break-words text-xs xl:text-sm">
          <div className="shadow-md rounded-md w-full flex flex-col gap-2 overflow-hidden">
            <div className="grid grid-cols-8 w-full font-bold bg-primary py-2 border-b border-gray-300">
                <p className='pl-5'></p>
                <p className='pl-5'>Date</p>
                <p className='pl-5'>Product</p>
                <p className='pl-5'>Unit Price</p>
                <p className='pl-5'>Quantity</p>
                <p className='pl-5'>Total</p>
                <p className='pl-5'>Stock</p>
                <p className='pl-5'>Settle</p>
            </div>
            <div className="slider h-full overflow-auto">
              {ordersData.map((order, index) => (
                <div key={index} className="grid grid-cols-8 items-center border-b border-gray-300">
                    <p className="col-span-1 p-2 border-r border-gray-300">
                        <input
                          type="checkbox"
                          id={`order-${index}`}
                          checked={selectedOrders.includes(order)}
                          onChange={() => handleOrderSelect(order)}
                          className='cursor-pointer'
                        />
                    </p>
                    <p className="col-span-1 p-2 border-r border-gray-300">{order.Date}</p>
                    <p className="col-span-1 p-2 border-r border-gray-300">{order.Product}</p>
                    <p className="col-span-1 p-2 border-r border-gray-300">{formatPrice(order.UnitPrice)}</p>
                    <p className="col-span-1 p-2 border-r border-gray-300">{order.Quantity}</p>
                    <p className="col-span-1 p-2 text-end pr-6 border-r border-gray-300">{formatPrice(order.Total)}</p>
                    <p className="col-span-1 p-2 border-r border-gray-300">{order.Stock}</p>
                    <div className="col-span-1 p-2">
                        <p className='bg-slate-100 rounded-md px-1 border-2 text-center cursor-pointer'>{order.Settle}</p>
                    </div>
                </div>
               ))}
            </div>
          </div>
          <div className='flex justify-between gap-5 font-medium text-xs border-2 border-gray-500 rounded-md border-dashed p-2'>
            <div className='flex justify-between w-1/2'>
                <div>
                    <p>Sub Total :</p>
                    <p>Payment Method :</p>
                    <p>Total :</p>
                </div>
                <div>
                    <p>LKR 2850.00</p>
                    <p>Cash</p>
                    <p>LKR 2850.00</p>
                </div>
            </div>
            <div className='grid grid-cols-2 w-1/2 gap-2'>
                <label className="block text-xs w-32 font-medium text-gray-700">
                    Return Amount :
                </label>
                <input
                    type="number"
                    className="block w-full text-xs lg:text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                />
                <label className="block text-xs w-32 font-medium text-gray-700">
                    Reason for return (Optional) :
                </label>
                <input
                    type="text"
                    className="block w-full text-xs lg:text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                />
            </div>
          </div>
        </div>
        <div className="flex justify-end py-2 px-4">
          <MainButton text='Return' onClick={() => onSubmit(selectedOrders)}/>
        </div>
      </div>
    </div>
  );
};

export default ReturnForm;

import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { MainButton } from '../../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { IoMdCloseCircle } from "react-icons/io";
import ReactToPrint from 'react-to-print';
import newRequest from '../../../utils/newRequest';

const PayOrder = ({ totalAmount, discount, cartItems, subTotal, onClose, serviceCharges, }) => {
    const [paymentMethod, setPaymentMethod] = useState('Cash');
  const renderPaymentFields = () => {
    if (paymentMethod === 'Cash') {
      return (
        <>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700">Cash Payment</label>
            <input
              type="number"
              className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
            />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700">Balance</label>
            <p className="block w-full text-sm font-bold py-2 px-4 leading-tight">LKR </p>
          </div>
        </>
      );
    } else if (paymentMethod === 'Card') {
      return (
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-md w-2/3 xl:w-1/2 h-auto overflow-hidden">
        <div className="flex justify-between py-2 px-4 items-center text-tColor bg-primary">
          <h2 className="font-bold">Pay Order</h2>
          <IoMdCloseCircle className="cursor-pointer text-lg" onClick={onClose} />
        </div>
        <div className='flex'>
          <div className='w-1/3 p-4 border-r-2 border-dashed'>
            <div className="relative mt-2">
              <label className="block text-xs font-medium text-gray-700">Registered Customers</label>
              <input
                className="block w-full text-xs xl:text-sm bg-secondary text-black font-medium border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary"
              />
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700">Phone Number</label>
              <input
                type="number"
                className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
              />
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
              />
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
              />
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700">Address</label>
              <input
                type="text"
                className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
              />
            </div>
            <div className="mt-2 flex flex-col">
              <MainButton text='Register' />
            </div>
          </div>
          <div className='w-2/3 py-2 px-4 flex flex-col justify-between'>
            <div className=''>
              <p className='text-xs xl:text-sm font-bold pb-2'>Payment Method</p>
              <div className='grid grid-cols-2 h-12 gap-2 text-xs font-medium'>
                <button
                  className={`w-full rounded-md flex items-center justify-center ${paymentMethod === 'Cash' ? 'bg-merunRed text-white' : 'bg-gray-200'}`}
                  onClick={() => setPaymentMethod('Cash')}
                >
                  Cash
                </button>
                <button
                  className={`w-full rounded-md flex items-center justify-center ${paymentMethod === 'Card' ? 'bg-merunRed text-white' : 'bg-gray-200'}`}
                  onClick={() => setPaymentMethod('Card')}
                >
                  Card
                </button>
              </div>
            
              <div className="mt-4">
                <p className="block text-xs font-medium text-gray-700">Total Amount</p>
                <p className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50">LKR </p>
              </div>
              {renderPaymentFields()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayOrder;

import React, { useState } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';
import { MainButton } from '../Button/Button';
import { toast } from 'react-toastify';
import predefinedDiscounts from '../../constants/discounts.json';

const DiscountTotalForm = ({ isOpen, onClose, onSave }) => {
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [password, setPassword] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState('');

  const handleSave = () => {
    const amount = parseFloat(discountAmount) || 0;
    const percentage = parseFloat(discountPercentage) || 0;

    if ((!selectedDiscount && amount === 0 && percentage === 0) || (amount < 0 || percentage < 0 || percentage > 100)) {
      toast.error("Invalid discount values. Percentage should be between 0 and 100.");
      return;
    }

    if (selectedDiscount) {
      const selectedDiscountData = predefinedDiscounts.predefinedDiscounts.find(discount => discount.name === selectedDiscount);
      if (selectedDiscountData) {
        onSave({ amount: selectedDiscountData.amount, percentage: selectedDiscountData.percentage, selectedDiscount });
        toast.success('Predefined discount applied successfully!');
      }
    } else {
      if (password !== 'SS728687') {
        toast.error("Invalid password. Only managers can add discounts.");
        return;
      }
      onSave({ amount, percentage, selectedDiscount });
      if (amount === 0 && percentage === 0) {
        toast.success('Remove Total Discount!');
      } else {
        toast.success('Discount applied successfully!');
      }
    }

    setDiscountAmount(0);
    setDiscountPercentage(0);
    setPassword('');
    setSelectedDiscount('');
    onClose();
  };
  
  const handleClear = () => {
    setDiscountAmount(0);
    setDiscountPercentage(0);
    setPassword('');
    setSelectedDiscount('');
    onSave({ amount: 0, percentage: 0, selectedDiscount: '' });
    toast.success('Cleared Discount!');
  };

  const handleSelectedDiscountChange = (event) => {
    const selectedDiscountName = event.target.value;
    setSelectedDiscount(selectedDiscountName);

    setDiscountAmount(0);
    setDiscountPercentage(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-md w-1/3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-secondary">Add Total Discount</h2>
          <IoMdCloseCircle className="cursor-pointer text-lg" onClick={onClose} />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Discount Amount</label>
          <input
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Discount Percentage</label>
          <input
            type="number"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        {/*<div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Select Predefined Discount</label>
          <select
            value={selectedDiscount}
            onChange={handleSelectedDiscountChange}
            className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          >
            <option value="">None</option>
            {predefinedDiscounts.predefinedDiscounts.map((discount, index) => (
              <option key={index} value={discount.name}>
                {discount.name}
              </option>
            ))}
          </select>
        </div>*/}
        <div className="mt-4 flex flex-col gap-2">
          <MainButton text="Apply" onClick={handleSave} />
          <MainButton text="Clear Discount" bgColor='bg-merunRed' onClick={handleClear} />
        </div>
      </div>
    </div>
  );
};

export default DiscountTotalForm;

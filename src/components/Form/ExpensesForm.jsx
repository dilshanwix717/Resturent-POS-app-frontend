import React, { useState } from 'react';
import { IoMdCloseCircle } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MainButton } from '../Button/Button';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';

const ExpensesForm = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState(null);
  const [amount, setAmount] = useState(0);
  const [expenseType, setExpenseType] = useState('');

  const handleSave = () => {
    if (!date || !amount || !expenseType) {
        toast.error("All fields are required.");
        return;
      }
  
      const expenseData = {
        date,
        amount: parseFloat(amount) || 0,
        expenseType,
      };
  
      onSave(expenseData);
      toast.success("Expense added successfully!");
      onClose();
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-md w-1/3">
        <div className="flex justify-between items-center">
          <h2 className='font-bold text-secondary'>Add Expense</h2>
          <IoMdCloseCircle className="cursor-pointer text-lg" onClick={onClose} />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Date</label>
          <div className='w-full flex items-center justify-between'>
            <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                isClearable
            />
            <FaRegCalendarAlt className='text-base' />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Expense</label>
          <input
            type="text"
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-4 flex flex-col">
          <MainButton text='Save Expense' onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default ExpensesForm;

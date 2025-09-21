import React, { useState, useEffect } from 'react';
import { IoMdCloseCircle } from "react-icons/io";
import { MainButton } from '../Button/Button';
import { toast } from 'react-toastify';
//import axios from 'axios'; // Make sure axios is imported
import { fetchDiscountUsers, verifyDiscountUser } from '../../api/apiService';


const DiscountItemForm = ({ isOpen, onClose, onSave, cartItem }) => {
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [password, setPassword] = useState('');
  const [discountUsers, setDiscountUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // In DiscountItemForm.js, update the useEffect that populates form fields

  useEffect(() => {
    if (cartItem) {
      // If editing an existing discount, populate fields with current values
      if (cartItem.customDiscount) {
        // Check if the discount was stored as an amount or percentage
        // This assumes you're tracking which type of discount was applied
        if (cartItem.discount && cartItem.discount.percentage) {
          setDiscountAmount(0);
          setDiscountPercentage(cartItem.discount.percentage);
        } else {
          setDiscountAmount(cartItem.customDiscount || 0);
          setDiscountPercentage(0);
        }
      } else {
        // No custom discount yet, initialize with zeros
        setDiscountAmount(0);
        setDiscountPercentage(0);
      }
      // If there was an authorizer, try to select them in the dropdown
      if (cartItem.discountAuthorizedBy) {
        // This will be executed after discount users are loaded
        const authorized = discountUsers.find(user => user.userId === cartItem.discountAuthorizedBy);
        if (authorized) {
          setSelectedUser(authorized);
        }
      }
    }
  }, [cartItem, discountUsers]);

  useEffect(() => {
    if (isOpen) {
      loadDiscountUsers();
    }
  }, [isOpen]);

  const loadDiscountUsers = async () => {
    try {
      setIsLoading(true);
      const users = await fetchDiscountUsers();
      setDiscountUsers(users);
    } catch (error) {
      toast.error('Failed to load discount users');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUser = async () => {
    if (!selectedUser) {
      toast.error('Please select a discount user');
      return false;
    }
    if (!password) {
      toast.error('Please enter password');
      return false;
    }

    try {
      setIsLoading(true);
      const authResult = await verifyDiscountUser(selectedUser.userId, password);
      if (authResult.authorized) {
        toast.success(`Verified as ${authResult.authorizerName}`);
        return authResult;
      } else {
        toast.error('Verification failed');
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  const handleSave = async () => {
    const amount = parseFloat(discountAmount) || 0;
    const percentage = parseFloat(discountPercentage) || 0;

    if (amount < 0 || percentage < 0 || percentage > 100) {
      toast.error("Invalid discount values. Percentage should be between 0 and 100.");
      return;
    }

    if (amount === 0 && percentage === 0) {
      // No discount being applied, can just clear
      onSave(cartItem, { amount: 0, percentage: 0, discountAuthorizedBy: null });
      toast.success('Removed Item Discount!');
      handleClose();
      return;
    }

    // Verify user before applying discount
    const authResult = await verifyUser();
    if (!authResult) {
      return;
    }

    // Apply discount with authorization details
    onSave(cartItem, {
      amount,
      percentage,
      discountAuthorizedBy: authResult.authorizerId,
      discountAuthorizedByName: authResult.authorizerName
    });

    toast.success('Discount added successfully!');
    handleClose();
  };

  const handleClear = () => {
    setDiscountAmount(0);
    setDiscountPercentage(0);
    setPassword('');
    setSelectedUser(null);
    onSave(cartItem, { amount: 0, percentage: 0, discountAuthorizedBy: null });
    toast.success('Cleared Discount!');
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setPassword('');
    setSelectedUser(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-md w-full max-w-md">
        <div className="flex justify-between items-center">
          <h2 className='font-bold text-secondary'>Add Item Discount</h2>
          <IoMdCloseCircle className="cursor-pointer text-lg" onClick={handleClose} />
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
          <label className="block text-xs font-medium text-gray-700">Select Discount User</label>
          <select
            value={selectedUser?.userId || ''}
            onChange={(e) => {
              const user = discountUsers.find(u => u.userId === e.target.value);
              setSelectedUser(user || null);
            }}
            className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
          >
            <option value="">Select a user</option>
            {discountUsers.map(user => (
              <option key={user.userId} value={user.userId}>
                {user.name} ({user.username})
              </option>
            ))}
          </select>
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
        <div className="mt-4 flex flex-col gap-2">
          <MainButton
            text={isLoading ? "Processing..." : "Apply"}
            onClick={handleSave}
            disabled={isLoading}
          />
          <MainButton
            text="Clear Discount"
            bgColor='bg-merunRed'
            onClick={handleClear}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscountItemForm;
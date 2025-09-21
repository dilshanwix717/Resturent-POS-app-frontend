import React, { useState, useEffect } from 'react';
import { MainButton } from '../Button/Button';

const CustomerEditForm = ({ customer, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        customerId: customer.customerId,
        name: customer.name,
        shopId: customer.shopId,
        contactNumber: customer.contactNumber,
        email: customer.email,
        address: customer.address,
        customerType: customer.customerType,
        loyaltyId: customer.loyaltyId,
        walletId: customer.walletId,
        createdBy: customer.createdBy
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-1/3">
        <h2 className="text-lg font-bold mb-4">Edit Customer</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium">Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              className="border rounded w-full px-3 py-2 text-xs" 
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium">Phone</label>
            <input 
              type="text" 
              name="contactNumber" 
              value={formData.contactNumber || ''} 
              onChange={handleChange} 
              className="border rounded w-full px-3 py-2 text-xs" 
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email || ''} 
              onChange={handleChange} 
              className="border rounded w-full px-3 py-2 text-xs" 
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium">Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address || ''} 
              onChange={handleChange} 
              className="border rounded w-full px-3 py-2 text-xs" 
            />
          </div>
          <div className="flex justify-end gap-2">
            <MainButton 
              text='Save' 
              onClick={handleSubmit} 
              className="mr-2"
            />
            <button 
              type="button" 
              onClick={onCancel} 
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerEditForm;

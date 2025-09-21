import React, { useState } from 'react';
import { MainButton } from '../../../components/Button/Button';
import { toast } from 'react-toastify';
import newRequest from '../../../utils/newRequest';

const New = () => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleCreateCustomer = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    if (!customerName || !email || !phone || !address) {
      toast.error("All fields are required.");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter a Customer Name.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const shopId = localStorage.getItem('shopId');
    const userId = localStorage.getItem('userId');

    try {
      const response = await newRequest.post('/customers/new-customer', {
        contactNumber: phone,
        name: customerName,
        shopId: shopId,
        email: email,
        address: address,
        customerType: 'regular',
        loyaltyId: '',
        walletId: '',
        createdBy: userId
      });

      const newCustomer = response.data;
      console.log('Customer created:', newCustomer);
      toast.success('Customer created successfully!');
      clearFields();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  };

  const handleCancel = () => {
    clearFields();
  };

  const clearFields = () => {
    setCustomerName('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className='slider h-screen-80px flex px-5 flex-col w-full overflow-auto'>
      <p className='text-base font-bold py-2'>Create Customer</p>
      <div className='w-1/2'>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">Customer Name</label>
          <input
            type="text"
            value={customerName}
            placeholder='John Doe'
            onChange={(e) => setCustomerName(e.target.value)}
            className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">Phone</label>
          <input
            type="number"
            value={phone}
            placeholder='0756789964'
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            placeholder='john.doe@example.com'
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={address}
            placeholder='123 Main St, City, Country'
            onChange={(e) => setAddress(e.target.value)}
            className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-2 flex justify-between">
          <MainButton text='Create Customer' onClick={handleCreateCustomer} />
          <p className="border-secondary border-2 text-secondary hover:bg-gray-100 text-nowrap p-2 px-4 rounded-md font-medium text-xs 2xl:text-base hover:shadow-lg cursor-pointer transition duration-300" onClick={handleCancel}>Cancel</p>
        </div>
      </div>
    </div>
  );
};

export default New;
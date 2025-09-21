import React, { useState, useEffect } from 'react';
import newRequest from '../../../utils/newRequest';
import { TiEdit } from "react-icons/ti";
import CustomerEditForm from '../../../components/Form/CustomerEditForm';

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editCustomer, setEditCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await newRequest.get('/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    setOffset(0);
  };

  const handleEditCustomer = (customer) => {
    setEditCustomer(customer);
    setShowEditForm(true);
  };

  const cancelEdit = () => {
    setEditCustomer(null);
    setShowEditForm(false);
  };

  const handleCustomerUpdate = async (updatedCustomer) => {
    try {
      await newRequest.put('/customers/update-customer', updatedCustomer);
      // Refresh customers list
      const response = await newRequest.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
    cancelEdit();
  };

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className='slider h-screen-80px flex px-5 flex-col w-full overflow-auto'>
      <p className='text-base font-bold py-2'>Manage Customer</p>
      <div className='flex items-center justify-between pb-3'>
        <div className='flex w-1/3'>
          <input
            className="block w-full rounded-l-md border-2 border-secondary text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight"
            id="text"
            placeholder='Search CustomerID/Name/Phone'
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          <button className='bg-secondary text-white text-nowrap font-medium px-4 text-xs xl:text-sm rounded-r-md 2xl:text-sm hover:shadow-lg transition duration-300'>Search</button>
        </div>
      </div>
      <div className="flex flex-col w-full h-full overflow-hidden break-words text-xs xl:text-sm">
        <div className="shadow-md rounded-md w-full flex flex-col overflow-hidden gap-2">
          <div className="grid grid-cols-7 w-full font-bold bg-primary py-2 border-b border-gray-300">
            <p className='pl-5'>No</p>
            <p className="pl-5">CustomerID</p>
            <p className="pl-5">Name</p>
            <p className="pl-5">Phone</p>
            <p className="pl-5">Email</p>
            <p className="pl-5">Address</p>
            <p className="pl-5"></p>
          </div>
          <div className="slider h-full overflow-auto">
            {filteredCustomers.map((customer, index) => (
              <div key={customer._id} className="grid grid-cols-7 items-center border-b border-gray-300">
                <p className="p-2 pl-5">{offset + index + 1}</p>
                <p className="p-2 pl-5">{customer.customerId}</p>
                <p className="p-2 pl-5">{customer.name}</p>
                <p className="p-2 pl-5">{customer.contactNumber}</p>
                <p className="p-2 pl-5">{customer.email}</p>
                <p className="p-2 pl-5">{customer.address}</p>
                <p className="p-2 pl-5 cursor-pointer" onClick={() => handleEditCustomer(customer)}>
                  <TiEdit />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showEditForm && (
        <CustomerEditForm 
          customer={editCustomer} 
          onUpdate={handleCustomerUpdate} 
          onCancel={cancelEdit} 
        />
      )}
    </div>
  );
};

export default CustomerList;
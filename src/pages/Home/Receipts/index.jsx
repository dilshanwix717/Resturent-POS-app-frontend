import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { fetchCustomerById, fetchOrders } from '../../../api/apiService';

import { MainButton } from '../../../components/Button/Button';
import RetuenForm from '../../../components/Form/ReturnForm';

const Receipts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (!endDate) {
      setEndDate(new Date());
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const formatPrice = (price) => {
    const numberPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberPrice);
  };

  const shopId = localStorage.getItem('shopId');
  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const orders = await fetchOrders();
        const today = new Date();
        const filteredOrders = orders
          .filter((order) => {
            const orderDate = new Date(order.transactionDateTime);
            return (
              order.shopId === shopId &&
              order.companyId === companyId &&
              orderDate.getDate() === today.getDate() &&
              orderDate.getMonth() === today.getMonth() &&
              orderDate.getFullYear() === today.getFullYear()
            );
          })
          .sort((a, b) => new Date(b.transactionDateTime) - new Date(a.transactionDateTime));
        setReceipts(filteredOrders);

        // Fetch customers
        const customers = await fetchCustomerById();
        setCustomers(customers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [shopId, companyId]);

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.customerId === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const filteredReceipts = receipts
    .filter((receipt) => {
      const customerName = getCustomerName(receipt.customerId).toLowerCase();
      const matchesSearch =
        customerName.includes(searchTerm.toLowerCase()) || receipt.invoiceID.includes(searchTerm);
      const matchesDateRange =
        startDate && endDate
          ? new Date(receipt.transactionDateTime) >= startDate &&
            new Date(receipt.transactionDateTime) <= endDate
          : true;
      return matchesSearch && matchesDateRange;
    })
    .sort((a, b) => new Date(b.transactionDateTime) - new Date(a.transactionDateTime));

  const openModal = (receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReceipt(null);
  };

  return (
    <div className="slider h-screen-80px flex px-5 flex-col w-full overflow-auto">
      <p className="text-base font-bold py-2">Receipt Details</p>
      <div className="flex items-center justify-between pb-3">
        <div className="flex w-1/3">
          <input
            className="block w-full rounded-l-md border-2 border-secondary text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight"
            id="text"
            placeholder="Search Customer/ReceiptID"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          <button className="bg-secondary text-white text-nowrap font-medium px-4 text-xs xl:text-sm rounded-r-md hover:shadow-lg transition duration-300">
            Search
          </button>
        </div>
      </div>
      <div className="flex flex-col w-full h-full overflow-hidden break-words text-xs xl:text-sm">
        <div className="shadow-md rounded-md w-full flex flex-col overflow-hidden gap-2">
          <div className="grid grid-cols-9 w-full font-bold bg-primary py-2 border-b border-gray-300">
            <p className="pl-5">No</p>
            <p className="pl-5">Customer</p>
            <p className="pl-5">Date</p>
            <p className="pl-5">InvoiceID</p>
            <p className="pl-5">Cash</p>
            <p className="pl-5">Card</p>
            <p className="pl-5">Total</p>
            <p className="pl-5">Status</p>
            <p className="pl-5"></p>
          </div>
          <div className="slider h-full overflow-auto">
            {filteredReceipts.map((receipt, index) => (
              <div
                key={receipt._id}
                className="grid grid-cols-9 items-center border-b border-gray-300 py-1"
              >
                <p className="p-2 pl-5">{index + 1}</p>
                <p className="p-2 pl-5">{getCustomerName(receipt.customerId)}</p>
                <p className="p-2 pl-5">
                  {new Date(receipt.transactionDateTime).toLocaleDateString()}
                </p>
                <p className="p-2 pl-5">{receipt.invoiceID}</p>
                <p className="p-2 pl-5">{formatPrice(receipt.cashAmount)}</p>
                <p className="p-2 pl-5">{formatPrice(receipt.cardAmount)}</p>
                <p className="p-2 pl-5">{formatPrice(receipt.billTotal)}</p>
                <p className="p-2 pl-5">{receipt.transactionStatus}</p>
                <MainButton text="Return" bgColor="bg-merunRed" onClick={() => openModal(receipt)} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <RetuenForm
        isOpen={isModalOpen}
        onClose={closeModal}
        transactionCode={selectedReceipt?.transactionCode || []}
      />
    </div>
  );
};

export default Receipts;

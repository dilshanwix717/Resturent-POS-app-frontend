import React, { useState } from 'react';
import productMovementData from '../../../constants/productMovement.json';
import DatePicker from 'react-datepicker';

const ProductMovement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  const formatPrice = (price) => {
    const numberPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberPrice);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const filteredProducts = productMovementData.filter(product => {
    const matchesSearch = product.Reference.includes(searchTerm) || product.ReturnID.includes(searchTerm);
    const matchesDateRange = startDate && endDate
      ? new Date(product.Date) >= startDate && new Date(product.Date) <= endDate
      : true;
    const matchesType = !selectedType || product.Type === selectedType;
    return matchesSearch && matchesDateRange && matchesType;
  }).sort((a, b) => new Date(b.Date) - new Date(a.Date));

  return (
    <div className='slider h-screen-80px flex px-5 flex-col w-full overflow-auto'>
      <p className='text-base font-bold py-2'>Product Movement</p>
      <div className='flex items-center justify-between pb-3'>
        <div className='flex w-1/3'>
          <input
            className="block w-full rounded-l-md border-2 border-secondary text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight"
            id="text"
            placeholder='Search Ref/ReturnID'
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          <button className='bg-secondary text-white text-nowrap font-medium px-4 text-xs xl:text-sm rounded-r-md 2xl:text-sm hover:shadow-lg transition duration-300'>Search</button>
        </div>
        <div className='flex gap-2'>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsStart
            startDatePlaceholderText="Start Date"
            endDatePlaceholderText="End Date"
            placeholderText='Start Date'
            className="border-2 border-secondary rounded-md w-28 py-2 px-4 text-xs xl:text-sm"
            isClearable
          />
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsEnd
            startDatePlaceholderText="Start Date"
            endDatePlaceholderText="End Date"
            placeholderText='End Date'
            className="border-2 border-secondary rounded-md w-28 py-2 px-4 text-xs xl:text-sm"
            isClearable
          />
        </div>
        <div>
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="block w-full rounded-md border-2 border-secondary text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
            <option value="Return">Return</option>
          </select>
        </div>
      </div>
      <div className="flex w-full h-full overflow-hidden break-words text-xs xl:text-sm">
        <div className="shadow-md rounded-md w-full flex flex-col gap-2 overflow-hidden">
          <div className="grid grid-cols-8 gap-2 w-full font-bold bg-primary py-2 px-5 border-b border-gray-300">
            <p>Date</p>
            <p>Type</p>
            <p>Reference</p>
            <p className='pl-5 '>Price</p>
            <p>Product Out</p>
            <p>Product In</p>
            <p>Return ID</p>
            <p>Inventory</p>
          </div>
          <div className="slider h-full overflow-auto">
            {filteredProducts.map((product, index) => (
              <div key={index} className="grid grid-cols-8 items-center border-b border-gray-300">
                <p className="col-span-1 p-2 border-r border-gray-300">{product.Date}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{product.Type}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{product.Reference}</p>
                <p className="col-span-1 p-2 text-end pr-6 border-r border-gray-300">{formatPrice(product.Price)}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{product.ProductOut}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{product.ProductIn}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{product.ReturnID}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{product.Inventory}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductMovement;

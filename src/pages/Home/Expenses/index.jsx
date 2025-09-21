import React, { useState } from 'react';
import { MainButton } from '../../../components/Button/Button';
import expensesData from '../../../constants/expenses.json';
import DatePicker from 'react-datepicker';
import ExpensesForm from '../../../components/Form/ExpensesForm';

const Expenses = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenses, setExpenses] = useState(expensesData);

  const formatPrice = (price) => {
    const numberPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberPrice);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleAddExpense = (expenseData) => {
    setExpenses([...expenses, {
      No: expenses.length + 1,
      Date: expenseData.date.toISOString().split('T')[0],
      Expenses: expenseData.expenseType,
      Amount: expenseData.amount,
      CreatedBy: "CurrentUser"
    }]);
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.Date);
    const matchesDateRange = startDate && endDate
      ? expenseDate >= startDate && expenseDate <= endDate
      : true;
    return matchesDateRange;
  }).sort((a, b) => new Date(b.Date) - new Date(a.Date));

  return (
    <div className='slider h-screen-80px flex px-5 flex-col w-full overflow-auto'>
      <p className='text-base font-bold py-2'>Total Expenses</p>
      <div className='flex items-center justify-between pb-3'>
        <div className='flex w-1/3'>
          <MainButton text='New Add Expenses' onClick={() => setIsFormOpen(true)} />
        </div>
        <div className='flex gap-2'>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            className="border-2 border-secondary rounded-md w-28 py-2 px-4 text-xs xl:text-sm"
            isClearable
          />
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            placeholderText="End Date"
            className="border-2 border-secondary rounded-md w-28 py-2 px-4 text-xs xl:text-sm"
            isClearable
          />
        </div>
        <div></div>
      </div>
      <div className="flex w-full h-full overflow-hidden break-words text-xs xl:text-sm">
        <div className="shadow-md rounded-md w-full flex flex-col gap-2 overflow-hidden">
          <div className="grid grid-cols-5 w-full font-bold bg-primary py-2 border-b border-gray-300">
            <p className='pl-5 border-r border-gray-300'>No</p>
            <p className='pl-5 border-r border-gray-300'>Date</p>
            <p className='pl-5 border-r border-gray-300'>Expenses</p>
            <p className='pl-5 border-r border-gray-300'>Amount</p>
            <p className='pl-5'>Created By</p>
          </div>
          <div className="slider h-full overflow-auto">
            {filteredExpenses.map((expense, index) => (
              <div key={index} className="grid grid-cols-5 items-center border-b border-gray-300">
                <p className="col-span-1 p-2 border-r border-gray-300">{expense.No}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{expense.Date}</p>
                <p className="col-span-1 p-2 border-r border-gray-300">{expense.Expenses}</p>
                <p className="col-span-1 p-2 text-end pr-6 border-r border-gray-300">{formatPrice(expense.Amount)}</p>
                <p className="col-span-1 p-2">{expense.CreatedBy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ExpensesForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleAddExpense} 
      />
    </div>
  );
};

export default Expenses;

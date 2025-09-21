import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { startDay, checkDailyBalance } from '../../api/apiService';

const Dashboard = ({ setDayStarted }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [cashAmount, setCashAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkBalance = async () => {
      try {
        const companyId = localStorage.getItem('companyId');
        const shopId = localStorage.getItem('shopId');
        const currentDate = new Date().toISOString().split('T')[0];
  
        const response = await checkDailyBalance(companyId, shopId, currentDate);
        console.log('Day Start:', response);
        if (response) {
          toast.info('Day already started. Redirecting to POS...');
          setDayStarted(true);
          navigate('/pos');
        }
      } catch (error) {
        if (error.message.includes('No daily balance entry found')) {
          toast.warn('No daily balance entry found. Please start the day.');
        } else {
          console.error('Error checking daily balance:', error.message);
          toast.error('Failed to check daily balance. Please try again.');
        }
      }
    };
  
    checkBalance();
  }, [navigate, setDayStarted]);
  

  const formatDateTime = (date) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleString('en-GB', options).replace(',', '');
  };

  const handleStartDay = async () => {
    if (!cashAmount || isNaN(cashAmount)) {
      toast.error('Please enter a valid cash amount');
      return;
    }

    const companyId = localStorage.getItem('companyId');
    const shopId = localStorage.getItem('shopId');
    const createdBy = localStorage.getItem('userId');

    const data = {
      companyId,
      shopId,
      createdBy,
      startAmount: cashAmount,
    };

    try {
      const response = await startDay(data);
      console.log('Day Start:', response);
      setDayStarted(true);
      navigate('/pos');
      localStorage.setItem('dayStarted', 'true');
    } catch (error) {
      console.error('Error starting the day:', error.response ? error.response.data : error.message);
      toast.error('Failed to start the day. Please try again.');
    }
  };

  return (
    <div className='flex px-5 w-full justify-center'>
      <div className='container flex flex-col gap-5'>
        <p>Date / Time: {formatDateTime(dateTime)}</p>
        <div className='flex w-1/2'>
          <p className='bg-secondary flex items-center rounded-l-md text-white text-nowrap font-medium px-4 text-sm 2xl:text-base'>LKR</p>
          <input
            className="block w-full border-2 border-secondary text-xs xl:text-sm bg-white text-gray-700 py-2 px-4 leading-tight"
            id="cashAmount"
            placeholder='0'
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
          />
          <button
            className='bg-secondary text-white text-nowrap font-medium px-4 text-sm rounded-r-md 2xl:text-base hover:shadow-lg transition duration-300'
            onClick={handleStartDay}
          >
            Start the day
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

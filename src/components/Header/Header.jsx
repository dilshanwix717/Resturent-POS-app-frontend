import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { RiMenuUnfold2Fill, RiMenuFold2Fill } from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import ConfirmationDialog from '../DialogBox/ConfirmationDialog';
import { fetchSellingTypes, logoutUser, checkDailyBalance, fetchOrders } from '../../api/apiService';

const Header = ({ collapsed, setCollapsed, setAuth, setDayStarted, onOptionSelect }) => {
  const [activeOption, setActiveOption] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [sellingTypes, setSellingTypes] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrdersAndHandleError();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrdersAndHandleError = async () => {
    try {
      const shopId = localStorage.getItem('shopId');
      const orders = await fetchOrders(shopId);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders. Logging out...');
      await logoutUser();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('dayStarted');
      setAuth(false);
      setDayStarted(false);
    }
  };

  useEffect(() => {
    const initializeSellingTypes = async () => {
      try {
        const shopId = localStorage.getItem('shopId');
        const companyId = localStorage.getItem('companyId');
        const types = await fetchSellingTypes();

        const filteredSellingTypes = types.filter(
          (type) => type.shopId === shopId && type.companyId === companyId && type.toggle === 'enable'
        );
        setSellingTypes(filteredSellingTypes);

        const dineInOption = filteredSellingTypes.find((type) => type.sellingType === 'Dine-in');

        if (dineInOption) {
          setActiveOption(dineInOption.sellingTypeId);
          onOptionSelect(dineInOption.sellingTypeId);
        } else if (filteredSellingTypes.length > 0 && !activeOption) {
          const firstTypeId = filteredSellingTypes[0].sellingTypeId;
          setActiveOption(firstTypeId);
          onOptionSelect(firstTypeId);
        }
      } catch (error) {
        console.error('Error fetching selling types:', error);
        toast.error('Failed to fetch selling types');
      }
    };

    if (location.pathname === '/pos') {
      initializeSellingTypes();
    }
  }, [location.pathname, onOptionSelect, activeOption]);

  useEffect(() => {
    const checkBalance = async () => {
      const companyId = localStorage.getItem('companyId');
      const shopId = localStorage.getItem('shopId');
      const currentDate = new Date().toISOString().split('T')[0];

      if (!companyId || !shopId) {
        console.warn('Missing companyId or shopId in localStorage.');
        return;
      }

      try {
        const response = await checkDailyBalance(companyId, shopId, currentDate);
        console.log('Daily balance entry exists:', response);
      } catch (error) {
        if (error.message === 'No daily balance entry found for the specified date.') {
          console.warn('Daily balance entry not found.');
          toast.error('Daily balance entry not found.');
          await logoutUser();
          localStorage.removeItem('dayStarted');
          setDayStarted(false);
          window.location.reload();
        } else {
          console.error('Unexpected error:', error);
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
    };

    if (location.pathname === '/pos') {
      checkBalance();
    }
  }, [setAuth, setDayStarted]);

  const handleLogout = () => {
    setShowDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logoutUser();
      setAuth(false);
      setDayStarted(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('dayStarted');
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('An error occurred during logout. Please try again.');
    } finally {
      setShowDialog(false);
    }
  };  

  const cancelLogout = () => {
    setShowDialog(false);
  };

  const isPosPage = location.pathname === '/pos';

  return (
    <>
      <header className="h-12 bg-transparent flex items-center justify-between">
        <button
          type="button"
          className="ml-5 text-lg"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <RiMenuFold2Fill /> : <RiMenuUnfold2Fill />}
        </button>
        <div className="flex items-center gap-5">
          <nav className="flex-grow">
            <ul className="flex justify-center space-x-4 text-xs xl:text-sm">
              {isPosPage &&
                sellingTypes.map((type) => (
                  <li key={type._id}>
                    <a
                      className={`cursor-pointer ${
                        activeOption === type.sellingTypeId
                          ? 'text-secondary hover:text-secondary'
                          : 'hover:text-secondary'
                      }`}
                      onClick={() => setActiveOption(type.sellingTypeId)}
                    >
                      {type.sellingType}
                    </a>
                  </li>
                ))}
              <li>
                <button className="hover:text-secondary focus:outline-none" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </nav>
          <div className="mr-5 flex items-center">
            <div className="w-6 h-6 overflow-hidden rounded-lg bg-gray-300 flex items-center justify-center">
              <img src="/assets/img/profile.svg" alt="profile" />
            </div>
          </div>
        </div>
      </header>
      {showDialog && (
        <ConfirmationDialog
          message="Are you sure you want to log out?"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
    </>
  );
};

export default Header;

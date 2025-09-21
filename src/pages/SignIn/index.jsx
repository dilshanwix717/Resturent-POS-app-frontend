import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CircleGroup from '../../components/UIelements/CircleGroup';
import { MainButton } from '../../components/Button/Button';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import newRequest from "../../utils/newRequest";
import { login, fetchBranches, fetchCompanies, checkDailyBalance } from "../../api/apiService";

const SignIn = ({ setAuth, setDayStarted }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState([]);
  const [company, setCompany] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchData = await fetchBranches();
        const enabledBranches = branchData.filter(branch => branch.toggle === 'enable');
        setBranches(enabledBranches);
      } catch (error) {
        console.error('Error fetching branches data:', error);
        toast.error('Failed to load branches');
      }
    };

    const loadCompanies = async () => {
      try {
        const companyData = await fetchCompanies();
        const enabledCompanies = companyData.filter(company => company.toggle === 'enable');
        setCompany(enabledCompanies);
      } catch (error) {
        console.error('Error fetching companies data:', error);
        toast.error('Failed to load companies');
      }
    };

    loadBranches();
    loadCompanies();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username) {
      toast.error('Username is required');
      return;
    }
    
    if (!password) {
      toast.error('Password is required');
      return;
    }

    if (!selectedBranch) {
      toast.error('Please select a branch');
      return;
    }

    console.log('Selected Branch:', selectedBranch);
    const selectedBranchDetails = branches.find(branch => branch.shopId === selectedBranch);
    const companyId = selectedBranchDetails.companyId;
    console.log('Selected Branch Company ID:', selectedBranchDetails.companyId);
    localStorage.setItem('companyId', companyId);

    try {
      const response = await newRequest.post('auth/login', {
        username,
        password,
        shopId: selectedBranch,
      });
    
      console.log('Login Response:', response.data);
    
      if (response.data.userId) {
        const { sessionToken, userId, username, companyId, shopId, email } = response.data;
        setAuth(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('sessionToken', sessionToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
        localStorage.setItem('shopId', shopId);
        localStorage.setItem('email', email);
    
        // Check for daily balance entry
        try {
          const today = new Date().toISOString().split('T')[0];
          const dayStartResponse = await checkDailyBalance(companyId, shopId, today);
          
          console.log('Daily Balance Response:', dayStartResponse.data);
    
          setDayStarted(true);
          localStorage.setItem('dayStarted', 'true');
          navigate('/pos');
        } catch (dayStartError) {
          // If the error is a 404, navigate to /dashboard
          if (dayStartError.response && dayStartError.response.status === 404) {
            console.warn('No daily balance entry found for the specified date.');
            navigate('/dashboard');
            localStorage.removeItem('bills');
            localStorage.removeItem('orders');
          } else {
            // Handle other errors
            setDayStarted(false);
            console.error('Error checking daily balance:', dayStartError);
            toast.error('An error occurred while checking daily balance');
          }
        }
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred during login');
    }    
  };

  // Filter branches based on the selected company
  const filteredBranches = selectedCompany 
    ? branches.filter(branch => branch.companyId === selectedCompany) 
    : [];

  return (
    <div className='h-screen w-full p-5 relative'>
      <div className='bg-primary w-full h-full rounded-xl relative'>
        <div className='background-overlay absolute inset-0 flex justify-between h-full p-10'>
          <div className='flex h-full justify-end items-end'>
            <CircleGroup />
          </div>
          <CircleGroup />
        </div>
        <div className='absolute flex flex-col gap-3 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-96 bg-white p-10 rounded-xl z-10'>
          <div className='flex justify-center'>
            <img src="/assets/logo.png" alt="logo" className='w-52' />
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="username" className='text-xs xl:text-sm'>User Name</label>
            <input
              className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="password" className='text-xs xl:text-sm'>Password</label>
            <div className="relative">
              <input
                className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="company" className='text-xs xl:text-sm'>Company</label>
            <select
              className="block w-full text-xs xl:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
              id="company"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select a company</option>
              {company.map(company => (
                <option key={company.companyId} value={company.companyId}>{company.companyName}</option>
              ))}
            </select>
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="branch" className='text-xs xl:text-sm'>Branch</label>
            <select
              className="block w-full text-xs xl:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
              id="branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={!selectedCompany} // Disable branch select if no company is selected
            >
              <option value="">Select a branch</option>
              {filteredBranches.map(branch => (
                <option key={branch.shopId} value={branch.shopId}>{branch.shopName}</option>
              ))}
            </select>
          </div>
          <MainButton text='Log In' onClick={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default SignIn;

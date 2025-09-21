import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import POS from './pages/Home/POS';
import Receipts from './pages/Home/Receipts';
import Stock from './pages/Home/Stock';
import Expenses from './pages/Home/Expenses';
import CashInHand from './pages/Home/CashInHand';
import ProductMovement from './pages/Home/ProductMovement';
import MainLayout from './layout/MainLayout';
import Profile from './pages/Profile';
import CustomerList from './pages/Customer/CustomerList';
import New from './pages/Customer/New';

const AppRoutes = ({ isAuthenticated, setIsAuthenticated, dayStarted, setDayStarted }) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn setAuth={setIsAuthenticated} setDayStarted={setDayStarted} />} />
      {isAuthenticated ? (
        <Route element={<MainLayout setAuth={setIsAuthenticated} setDayStarted={setDayStarted} handleOptionSelect={handleOptionSelect} />}>
          <Route path="/dashboard" element={dayStarted ? <Navigate to="/pos" /> : <Dashboard setDayStarted={setDayStarted} />} />
          <Route path="/pos" element={<POS selectedOption={selectedOption} />} />
          <Route path="/receipts" element={dayStarted ? <Receipts /> : <Navigate to="/dashboard" />} />
          <Route path="/stock" element={dayStarted ? <Stock /> : <Navigate to="/dashboard" />} />
          <Route path="/expenses" element={dayStarted ? <Expenses /> : <Navigate to="/dashboard" />} />
          <Route path="/cashinhand" element={dayStarted ? <CashInHand /> : <Navigate to="/dashboard" />} />
          <Route path="/productmovement" element={dayStarted ? <ProductMovement /> : <Navigate to="/dashboard" />} />
          <Route path="/profile" element={dayStarted ? <Profile /> : <Navigate to="/dashboard" />} />
          <Route path="/customerlist" element={dayStarted ? <CustomerList /> : <Navigate to="/dashboard" />} />
          <Route path="/new" element={dayStarted ? <New /> : <Navigate to="/dashboard" />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/" />} />
      )}
    </Routes>
  );
};

export default AppRoutes;

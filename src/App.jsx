import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import AppRoutes from './Routes';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dayStarted, setDayStarted] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    console.log('isAuthenticated: ' + auth);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    const dayStart = localStorage.getItem('dayStarted');
    console.log('dayStarted: ' + dayStart);
    
    if (dayStart === 'true') {
      setDayStarted(true);
    }
  }, []);

  const toastStyle = {
    fontSize: '0.8rem'
  };

  return (
    <>
      <ToastContainer style={toastStyle}/>
      <Router>
        <AppRoutes 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated}
          dayStarted={dayStarted}
          setDayStarted={setDayStarted}
          className='slider'
        />
      </Router>
    </>
  );
};

export default App;

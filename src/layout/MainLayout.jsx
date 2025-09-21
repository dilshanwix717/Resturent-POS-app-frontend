import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const { Content } = Layout;

const MainLayout = ({ setAuth, handleOptionSelect }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          setAuth={setAuth} 
          onOptionSelect={handleOptionSelect} 
        />
        <Content>
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default MainLayout;

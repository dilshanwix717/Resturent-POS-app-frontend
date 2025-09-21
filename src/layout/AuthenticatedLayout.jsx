import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const { Content } = Layout;

const AuthenticatedLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content>
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default AuthenticatedLayout;

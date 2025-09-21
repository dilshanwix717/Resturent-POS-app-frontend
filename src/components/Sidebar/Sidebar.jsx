import React from 'react';
import { Layout } from 'antd';
import CircleGroup from '../../components/UIelements/CircleGroup';
import Logo from './Logo';
import MenuList from './MenuList';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  return (
    <Sider 
      collapsed={collapsed} 
      collapsible 
      trigger={null} 
      className='slider m-2 rounded-xl h-screen-16px relative bg-primary overflow-x-hidden'
    >
      <div className='relative z-10'>
        <Logo />
        <MenuList />
      </div>
      <div className='absolute bottom-0 z-0'>
        <CircleGroup />
      </div>
    </Sider>
  );
};

export default Sidebar;

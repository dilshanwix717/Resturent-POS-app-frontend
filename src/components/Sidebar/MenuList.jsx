import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { VscHome } from "react-icons/vsc";
import { FaRegUser } from "react-icons/fa";
import { LiaHeadsetSolid } from "react-icons/lia";

const MenuList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleClick = ({ key }) => {
    navigate(`/${key}`);
  };

  const menuItems = [
    {
      key: 'home',
      icon: <VscHome />,
      label: 'Home',
      children: [
        { key: 'pos', label: 'POS' },
        { key: 'receipts', label: 'Receipts' },
        { key: 'stock', label: 'Product' },
        { key: 'expenses', label: 'Expenses' },
        // { key: 'productmovement', label: 'Product Movement' },
      ],
    },
    /*{
      key: 'profile',
      icon: <FaRegUser />,
      label: 'Profile',
    },*/
    {
      key: 'customer',
      icon: <LiaHeadsetSolid />,
      label: 'Customer',
      children: [
        { key: 'customerlist', label: 'Customer List' },
        { key: 'new', label: 'New' },
      ],
    },
  ];

  const findSelectedKey = (path) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  return (
    <Menu
      mode='inline'
      className='bg-primary text-tColor'
      items={menuItems}
      onClick={handleClick}
      selectedKeys={[findSelectedKey(location.pathname)]}
    />
  );
};

export default MenuList;

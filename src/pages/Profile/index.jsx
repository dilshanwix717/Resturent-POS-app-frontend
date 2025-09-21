import React, { useState } from 'react';
import { MainButton } from '../../components/Button/Button';
import { toast } from 'react-toastify';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const Profile = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleShowPassword = (passwordType) => {
    switch (passwordType) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const handleChangePassword = () => {
    if (!userName || !email || !currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    toast.success('Password changed successfully!');
    setUserName('');
    setEmail('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className='slider h-screen-80px flex px-5 flex-col w-full overflow-auto'>
      <p className='text-base font-bold py-2'>Profile</p>
      <div className='w-1/2'>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">User Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
          />
        </div>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">Current Password</label>
          <div className='relative'>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => handleShowPassword('current')}
            >
              {showCurrentPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">New Password</label>
          <div className='relative'>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => handleShowPassword('new')}
            >
              {showNewPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs mb-2 font-medium text-gray-700">Confirm Password</label>
          <div className='relative'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full text-xs xl:text-sm bg-white text-gray-700 border border-gray-300 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => handleShowPassword('confirm')}
            >
              {showConfirmPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col">
          <MainButton text='Change Password' onClick={handleChangePassword} />
        </div>
      </div>
    </div>
  );
};

export default Profile;

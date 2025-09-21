import React, { useState, useEffect } from 'react';
import { IoMdCloseCircle } from "react-icons/io";
import { MainButton } from '../Button/Button';
import { toast } from 'react-toastify';
import { fetchDiscountUsers, verifyDiscountUser } from '../../api/apiService';

const ServiceChargeForm = ({ isOpen, onClose, onSave, serviceChargeData }) => {
    const [serviceChargeAmount, setServiceChargeAmount] = useState(0);
    const [serviceChargePercentage, setServiceChargePercentage] = useState(0);
    const [password, setPassword] = useState('');
    const [discountUsers, setDiscountUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (serviceChargeData) {
            setServiceChargeAmount(serviceChargeData?.amount || 0);
            setServiceChargePercentage(serviceChargeData?.percentage || 0);
        }
    }, [serviceChargeData]);

    useEffect(() => {
        if (isOpen) {
            loadDiscountUsers();
        }
    }, [isOpen]);

    const loadDiscountUsers = async () => {
        try {
            setIsLoading(true);
            const users = await fetchDiscountUsers();
            setDiscountUsers(users);
        } catch (error) {
            toast.error('Failed to load authorized users');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyUser = async () => {
        if (!selectedUser) {
            toast.error('Please select an authorized user');
            return false;
        }
        if (!password) {
            toast.error('Please enter password');
            return false;
        }

        try {
            setIsLoading(true);
            const authResult = await verifyDiscountUser(selectedUser.userId, password);
            if (authResult.authorized) {
                toast.success(`Verified as ${authResult.authorizerName}`);
                return authResult;
            } else {
                toast.error('Verification failed');
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const amount = parseFloat(serviceChargeAmount) || 0;
        const percentage = parseFloat(serviceChargePercentage) || 0;

        if (amount < 0 || percentage < 0 || percentage > 100) {
            toast.error("Invalid service charge values. Percentage should be between 0 and 100.");
            return;
        }

        if (amount === 0 && percentage === 0) {
            // No service charge being applied, can just clear
            onSave({ amount: 0, percentage: 0, serviceChargeAuthorizedBy: null });
            toast.success('Removed Service Charge!');
            handleClose();
            return;
        }

        // Verify user before applying service charge
        const authResult = await verifyUser();
        if (!authResult) {
            return;
        }

        // Apply service charge with authorization details
        onSave({
            amount,
            percentage,
            serviceChargeAuthorizedBy: authResult.authorizerId,
            serviceChargeAuthorizedByName: authResult.authorizerName
        });

        toast.success('Service Charge added successfully!');
        handleClose();
    };

    const handleClear = () => {
        setServiceChargeAmount(0);
        setServiceChargePercentage(0);
        setPassword('');
        setSelectedUser(null);
        onSave({ amount: 0, percentage: 0, serviceChargeAuthorizedBy: null });
        toast.success('Cleared Service Charge!');
        onClose();
    };

    const handleClose = () => {
        // Reset form
        setPassword('');
        setSelectedUser(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-md w-full max-w-md">
                <div className="flex justify-between items-center">
                    <h2 className='font-bold text-secondary'>Add Service Charge</h2>
                    <IoMdCloseCircle className="cursor-pointer text-lg" onClick={handleClose} />
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700">Service Charge Amount</label>
                    <input
                        type="number"
                        value={serviceChargeAmount}
                        onChange={(e) => setServiceChargeAmount(e.target.value)}
                        className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                    />
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700">Service Charge Percentage</label>
                    <input
                        type="number"
                        value={serviceChargePercentage}
                        onChange={(e) => setServiceChargePercentage(e.target.value)}
                        className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                    />
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700">Select Authorized User</label>
                    <select
                        value={selectedUser?.userId || ''}
                        onChange={(e) => {
                            const user = discountUsers.find(u => u.userId === e.target.value);
                            setSelectedUser(user || null);
                        }}
                        className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                    >
                        <option value="">Select a user</option>
                        {discountUsers.map(user => (
                            <option key={user.userId} value={user.userId}>
                                {user.name} ({user.username})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full text-xm lg:text-sm bg-gray-100 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                    />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <MainButton
                        text={isLoading ? "Processing..." : "Apply"}
                        onClick={handleSave}
                        disabled={isLoading}
                    />
                    <MainButton
                        text="Clear Service Charge"
                        bgColor='bg-merunRed'
                        onClick={handleClear}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default ServiceChargeForm;
import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { MainButton } from "../../components/Button/Button";

const CustomServiceChargeForm = ({ isOpen, onClose, onSave, currentCharge }) => {
    const [serviceCharge, setServiceCharge] = useState(currentCharge || 0);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(parseFloat(serviceCharge));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-80">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Custom Service Charge</h2>
                    <IoMdClose className="cursor-pointer text-xl" onClick={onClose} />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Service Charge Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={serviceCharge}
                            onChange={(e) => setServiceCharge(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <MainButton
                        text="Apply Service Charge"
                        type="submit"
                    />
                </form>
            </div>
        </div>
    );
};

export default CustomServiceChargeForm;
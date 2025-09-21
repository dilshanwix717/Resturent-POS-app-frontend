import React from 'react';

const ConfirmationDialog = ({ message, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white p-8 rounded-md shadow-md">
        <p className="text-base font-bold mb-4">{message}</p>
        <div className="flex justify-center">
          <button
            className="bg-secondary text-white px-4 py-2 rounded-md mr-2"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            onClick={onCancel}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

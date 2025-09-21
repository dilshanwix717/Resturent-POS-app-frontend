import React from 'react';

export const MainButton = ({ text, onClick, bgColor = 'bg-secondary' }) => {
    return (
        <button 
            className={`${bgColor} text-white text-nowrap p-2 px-4 rounded-md font-medium text-xs 2xl:text-base hover:shadow-lg transition duration-300`} 
            onClick={onClick}
        >
            {text}
        </button>
    );
};

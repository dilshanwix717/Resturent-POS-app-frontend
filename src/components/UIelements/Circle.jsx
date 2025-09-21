import React from 'react';

const Circle = ({ outerClassName = '', innerClassName = '' }) => {
  return (
    <div className={`bg-secondary opacity-25 w-48 h-48 rounded-full flex items-center justify-center ${outerClassName}`}>
      <div className={`bg-primary w-36 h-36 rounded-full ${innerClassName}`}></div>
    </div>
  );
};

export default Circle;

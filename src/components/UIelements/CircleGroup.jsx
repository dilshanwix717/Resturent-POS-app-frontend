import React from 'react';
import Circle from './Circle';

const CircleGroup = ({ outerClassName = '', innerClassName = '' }) => {
  return (
    <div className={`w-80 ${outerClassName}`}>
      <div className="flex w-full justify-end">
        <Circle innerClassName={innerClassName} />
      </div>
      <Circle innerClassName={innerClassName} />
    </div>
  );
};

export default CircleGroup;

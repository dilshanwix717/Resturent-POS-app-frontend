import React, { useRef } from "react";
import { IoIosArrowDropright, IoIosArrowDropleft } from "react-icons/io";

const CategoryBar = ({ categories, selectedCategory, onCategoryClick }) => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    const step = 150;
    const slider = sliderRef.current;
    slider.scrollLeft += direction === "left" ? -step : step;
  };

  return (
    <div className='relative bg-primary bg-opacity-75 flex gap-2 rounded-md p-2 mb-4'>
      <button
        onMouseDown={() => scroll("left")}
        className="absolute left-0 top-0 bg-primary text-black px-2 h-full rounded"
      >
        <IoIosArrowDropleft />
      </button>
      <div
        ref={sliderRef}
        className="flex gap-1 p-2 px-6 overflow-x-auto slider touch-scroll"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {categories.map((category) => (
          <div
            key={category.categoryId}
            className={`flex flex-col h-full gap-1 xl:gap-3 text-nowrap items-center bg-secondary bg-opacity-50 py-2 px-5 rounded-xl border-2 cursor-pointer ${selectedCategory === category.categoryId ? 'bg-opacity-100' : 'bg-opacity-50 border-secondary'}`}
            onClick={() => onCategoryClick(category.categoryId)}
          >
            <p className="font-medium text-xs 2xl:text-sm text-white">
              {category.categoryName}
            </p>
          </div>
        ))}
      </div>
      <button
        onMouseDown={() => scroll("right")}
        className="absolute right-0 top-0 bg-primary text-black px-2 h-full rounded"
      >
        <IoIosArrowDropright />
      </button>
    </div>
  );
};

export default CategoryBar;

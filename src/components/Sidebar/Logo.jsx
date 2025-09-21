import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <div className="flex items-center justify-center text-white bg-primary p-3">
      <Link to="/pos" className="w-10 h-10 flex items-center justify-center">
        <img src="/assets/logo.png" alt="logo" />
      </Link>
    </div>
  );
};

export default Logo;

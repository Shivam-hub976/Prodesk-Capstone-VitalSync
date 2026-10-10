import React from "react";

const Logo = ({ className = "w-12 h-12" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={className}
  >
    <rect width="100" height="100" rx="22" fill="#0284c7" />
    <path
      d="M50 22 v56 M22 50 h56"
      stroke="#ffffff"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <path
      d="M30 50 h12 l6 -12 l8 24 l6 -12 h18"
      stroke="#38bdf8"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;

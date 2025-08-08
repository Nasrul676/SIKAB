"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const CollapseItem = ({ title, children, disabled }: { title: any, children: any, disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2 overflow-hidden">
      <button onClick={toggleCollapse} disabled={disabled} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-300" aria-expanded={isOpen}>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>
        <ChevronDown className={`w-5 h-5 text-gray-600 dark:text-gray-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="p-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CollapseItem;
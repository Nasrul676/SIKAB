import React from "react";

const StatCard = ({
  title,
  value,
  icon: IconComponent,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) => {
  return (
    <div
      className={`rounded-xl shadow-lg dark:shadow-slate-700 p-6 flex items-center space-x-4 ${color}`}
    >
      <div
        className={`p-3 rounded-full ${color
          .replace("bg-", "bg-")
          .replace("text-", "text-")}`}
      >
        <IconComponent size={28} />
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

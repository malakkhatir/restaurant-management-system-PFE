import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServantCard = ({ 
  title, 
  description, 
  icon: Icon, 
  route, 
  colorScheme = 'blue' 
}) => {
  const navigate = useNavigate();

  const colorVariants = {
    blue: {
      from: 'from-blue-50',
      to: 'to-blue-100',
      hoverFrom: 'hover:from-blue-100',
      hoverTo: 'hover:to-blue-200',
      iconBg: 'bg-blue-100',
      iconHoverBg: 'group-hover:bg-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-700',
      textHoverColor: 'group-hover:text-blue-800'
    },
    green: {
      from: 'from-green-50',
      to: 'to-green-100',
      hoverFrom: 'hover:from-green-100',
      hoverTo: 'hover:to-green-200',
      iconBg: 'bg-green-100',
      iconHoverBg: 'group-hover:bg-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-700',
      textHoverColor: 'group-hover:text-green-800'
    },
    orange: {
      from: 'from-orange-50',
      to: 'to-orange-100',
      hoverFrom: 'hover:from-orange-100',
      hoverTo: 'hover:to-orange-200',
      iconBg: 'bg-orange-100',
      iconHoverBg: 'group-hover:bg-orange-200',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      textColor: 'text-orange-700',
      textHoverColor: 'group-hover:text-orange-800'
    },
    pink: {
      from: 'from-pink-50',
      to: 'to-pink-100',
      hoverFrom: 'hover:from-pink-100',
      hoverTo: 'hover:to-pink-200',
      iconBg: 'bg-pink-100',
      iconHoverBg: 'group-hover:bg-pink-200',
      iconColor: 'text-pink-600',
      titleColor: 'text-pink-900',
      textColor: 'text-pink-700',
      textHoverColor: 'group-hover:text-pink-800'
    },
    indigo: {
      from: 'from-indigo-50',
      to: 'to-indigo-100',
      hoverFrom: 'hover:from-indigo-100',
      hoverTo: 'hover:to-indigo-200',
      iconBg: 'bg-indigo-100',
      iconHoverBg: 'group-hover:bg-indigo-200',
      iconColor: 'text-indigo-600',
      titleColor: 'text-indigo-900',
      textColor: 'text-indigo-700',
      textHoverColor: 'group-hover:text-indigo-800'
    }
  };

  const colors = colorVariants[colorScheme];

  return (
    <div
      className={`group bg-gradient-to-br ${colors.from} ${colors.to} ${colors.hoverFrom} ${colors.hoverTo} 
        transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl 
        p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1`}
      onClick={() => navigate(route)}
    >
      <div className={`${colors.iconBg} ${colors.iconHoverBg} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
        rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300`}>
        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${colors.iconColor}`} />
      </div>
      <h3 className={`text-lg sm:text-xl font-bold ${colors.titleColor} mb-2 sm:mb-3`}>
        {title}
      </h3>
      <p className={`text-xs sm:text-sm ${colors.textColor} ${colors.textHoverColor} transition-colors duration-300`}>
        {description}
      </p>
    </div>
  );
};

export default ServantCard;
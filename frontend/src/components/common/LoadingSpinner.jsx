import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-t-primary-600',
    secondary: 'border-t-secondary-600',
    white: 'border-t-white',
    gray: 'border-t-gray-600',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div
        className={clsx(
          'spinner border-2 border-gray-300',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;


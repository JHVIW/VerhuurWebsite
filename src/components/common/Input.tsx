import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', icon: Icon, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            {...props}
            className={`
              w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
              ${Icon ? 'pl-10' : ''}
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
              dark:border-gray-600 dark:bg-gray-800 dark:text-white
              dark:focus:border-blue-400 dark:focus:ring-blue-400
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500 dark:border-red-400' : ''}
              ${className}
            `}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  type: string;
  options?: { value: string; label: string }[];
}

export function AuthInput({ label, type, options, className = '', ...props }: AuthInputProps) {
  const baseClassName = `appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${className}`;

  if (type === 'select' && options) {
    return (
      <div>
        <label htmlFor={props.id} className="sr-only">
          {label}
        </label>
        <select
          {...props}
          className={baseClassName}
        >
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={props.id} className="sr-only">
        {label}
      </label>
      <input
        type={type}
        {...props}
        className={baseClassName}
      />
    </div>
  );
}



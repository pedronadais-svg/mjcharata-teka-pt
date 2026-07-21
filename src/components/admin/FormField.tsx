'use client';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date' | 'password' | 'select';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  help?: string;
  maxLength?: number;
  rows?: number;
  options?: { value: string; label: string }[];
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  help,
  maxLength,
  rows = 4,
  options,
  className = '',
}: FormFieldProps) {
  const inputBase = 'w-full rounded border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red disabled:bg-gray-50 disabled:text-gray-400';
  const borderClass = error ? 'border-red-300' : 'border-gray-300';

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-teka-dark mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={`${inputBase} ${borderClass} resize-y`}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={`${inputBase} ${borderClass}`}
        >
          <option value="">Seleccionar...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className={`${inputBase} ${borderClass}`}
        />
      )}

      {maxLength && type === 'textarea' && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {String(value).length}/{maxLength}
        </p>
      )}

      {help && !error && (
        <p className="text-xs text-gray-400 mt-1">{help}</p>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

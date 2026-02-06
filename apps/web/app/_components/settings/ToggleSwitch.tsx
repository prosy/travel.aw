'use client';

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label
          htmlFor={id}
          className={`text-sm font-medium ${
            disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
          }`}
        >
          {label}
        </label>
        {description && (
          <p className={`mt-0.5 text-sm ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

interface ToggleGroupProps {
  title: string;
  children: React.ReactNode;
}

export function ToggleGroup({ title, children }: ToggleGroupProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200 px-4 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );
}

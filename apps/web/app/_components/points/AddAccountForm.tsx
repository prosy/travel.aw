'use client';

import { useState } from 'react';
import type { CreatePointsAccount, PointsProgramType } from '@travel/contracts';

interface AddAccountFormProps {
  onSubmit: (data: CreatePointsAccount) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const programTypes: { value: PointsProgramType; label: string }[] = [
  { value: 'airline', label: 'Airline' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'car_rental', label: 'Car Rental' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
];

export function AddAccountForm({ onSubmit, onCancel, isLoading }: AddAccountFormProps) {
  const [formData, setFormData] = useState<CreatePointsAccount>({
    programType: 'airline',
    programName: '',
    membershipTier: '',
    currentBalance: 0,
    pendingPoints: 0,
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="programType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Program Type
          </label>
          <select
            id="programType"
            name="programType"
            value={formData.programType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {programTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="programName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Program Name
          </label>
          <input
            type="text"
            id="programName"
            name="programName"
            value={formData.programName}
            onChange={handleChange}
            placeholder="e.g., Delta SkyMiles"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="membershipTier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Membership Tier
          </label>
          <input
            type="text"
            id="membershipTier"
            name="membershipTier"
            value={formData.membershipTier || ''}
            onChange={handleChange}
            placeholder="e.g., Gold, Platinum"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Account Number
          </label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={formData.accountNumber || ''}
            onChange={handleChange}
            placeholder="Optional"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Balance
          </label>
          <input
            type="number"
            id="currentBalance"
            name="currentBalance"
            value={formData.currentBalance ?? ''}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="pendingPoints" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pending Points
          </label>
          <input
            type="number"
            id="pendingPoints"
            name="pendingPoints"
            value={formData.pendingPoints ?? ''}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="annualFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Annual Fee
          </label>
          <input
            type="number"
            id="annualFee"
            name="annualFee"
            value={formData.annualFee ?? ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="For credit cards"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="nextFeeDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Next Fee Date
          </label>
          <input
            type="date"
            id="nextFeeDate"
            name="nextFeeDate"
            value={formData.nextFeeDate || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Any additional notes..."
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !formData.programName}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding...
            </>
          ) : (
            'Add Account'
          )}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import type { CreateSupportTicket, TicketCategory, TicketPriority } from '@travel/contracts';

interface TicketFormProps {
  onSubmit: (data: CreateSupportTicket) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const categories: { value: TicketCategory; label: string; description: string }[] = [
  { value: 'account', label: 'Account', description: 'Login, profile, or settings issues' },
  { value: 'trips', label: 'Trips', description: 'Trip planning, bookings, or itineraries' },
  { value: 'billing', label: 'Billing', description: 'Payments, refunds, or subscriptions' },
  { value: 'technical', label: 'Technical', description: 'Bugs, errors, or app performance' },
  { value: 'other', label: 'Other', description: 'General questions or feedback' },
];

const priorities: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function TicketForm({ onSubmit, onCancel, isLoading }: TicketFormProps) {
  const [formData, setFormData] = useState<CreateSupportTicket>({
    subject: '',
    category: 'other',
    message: '',
    priority: 'normal',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedCategory = categories.find((c) => c.value === formData.category);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, category: category.value }))}
              className={`rounded-lg border p-3 text-left transition-colors ${
                formData.category === category.value
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
              }`}
            >
              <p className={`text-sm font-medium ${
                formData.category === category.value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {category.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {category.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief description of your issue"
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          required
          placeholder="Please describe your issue in detail. Include any relevant information like error messages, steps to reproduce, etc."
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.message.length} / 2000 characters
        </p>
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
          disabled={isLoading || !formData.subject || !formData.message}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Ticket'
          )}
        </button>
      </div>
    </form>
  );
}

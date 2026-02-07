'use client';

import type { PointsProgramType } from '@travel/contracts';

export interface ParsedProgram {
  programName: string;
  programType: PointsProgramType;
  accountNumber: string | null;
  membershipTier: string | null;
  notes: string | null;
}

interface ImportReviewTableProps {
  programs: ParsedProgram[];
  onUpdate: (index: number, field: keyof ParsedProgram, value: string | null) => void;
  onRemove: (index: number) => void;
}

const programTypeLabels: Record<PointsProgramType, string> = {
  airline: 'Airline',
  hotel: 'Hotel',
  car_rental: 'Car Rental',
  credit_card: 'Credit Card',
  other: 'Other',
};

const programTypes: PointsProgramType[] = ['airline', 'hotel', 'car_rental', 'credit_card', 'other'];

export function ImportReviewTable({ programs, onUpdate, onRemove }: ImportReviewTableProps) {
  if (programs.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500">
        No programs extracted. Try uploading a different image or pasting text.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Program Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Type
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Account #
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Tier
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Notes
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">

            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
          {programs.map((program, index) => (
            <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={program.programName}
                  onChange={(e) => onUpdate(index, 'programName', e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600"
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={program.programType}
                  onChange={(e) => onUpdate(index, 'programType', e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600"
                >
                  {programTypes.map((type) => (
                    <option key={type} value={type}>
                      {programTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={program.accountNumber || ''}
                  onChange={(e) => onUpdate(index, 'accountNumber', e.target.value || null)}
                  placeholder="—"
                  className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={program.membershipTier || ''}
                  onChange={(e) => onUpdate(index, 'membershipTier', e.target.value || null)}
                  placeholder="—"
                  className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={program.notes || ''}
                  onChange={(e) => onUpdate(index, 'notes', e.target.value || null)}
                  placeholder="—"
                  className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600"
                />
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

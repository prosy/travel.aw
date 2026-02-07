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
  existingProgramNames: string[];
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

export function ImportReviewTable({ programs, existingProgramNames, onUpdate, onRemove }: ImportReviewTableProps) {
  const existingNamesLower = existingProgramNames.map((n) => n.toLowerCase());

  const isDuplicate = (programName: string) =>
    existingNamesLower.includes(programName.toLowerCase());

  const duplicateCount = programs.filter((p) => isDuplicate(p.programName)).length;

  if (programs.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500">
        No programs extracted. Try uploading a different image or pasting text.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {duplicateCount > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {duplicateCount} program{duplicateCount !== 1 ? 's' : ''} already exist{duplicateCount === 1 ? 's' : ''} in your account
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Programs marked with a warning badge have the same name as existing entries.
                Importing will create new separate entries — existing data will not be changed.
                Remove any you don&apos;t want to import.
              </p>
            </div>
          </div>
        </div>
      )}
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
          {programs.map((program, index) => {
            const hasDuplicate = isDuplicate(program.programName);
            return (
            <tr key={index} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800 ${hasDuplicate ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={program.programName}
                    onChange={(e) => onUpdate(index, 'programName', e.target.value)}
                    className={`w-full rounded border bg-transparent px-2 py-1 text-sm focus:border-blue-500 focus:outline-none ${hasDuplicate ? 'border-amber-400 dark:border-amber-600' : 'border-zinc-300 dark:border-zinc-600'}`}
                  />
                  {hasDuplicate && (
                    <span className="flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-800 dark:text-amber-200" title="A program with this name already exists">
                      Exists
                    </span>
                  )}
                </div>
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
          );
          })}
        </tbody>
      </table>
    </div>
  );
}

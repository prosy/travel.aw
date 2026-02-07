'use client';

import { useState, useRef } from 'react';
import { ImportReviewTable, type ParsedProgram } from './ImportReviewTable';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (programs: ParsedProgram[]) => Promise<void>;
}

type Step = 'upload' | 'review' | 'success';

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [programs, setPrograms] = useState<ParsedProgram[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/points/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to parse image');
      }

      setPrograms(data.programs);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextParse = async () => {
    if (!textInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/points/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to parse text');
      }

      setPrograms(data.programs);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgram = (index: number, field: keyof ParsedProgram, value: string | null) => {
    setPrograms((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleRemoveProgram = (index: number) => {
    setPrograms((prev) => prev.filter((_, i) => i !== index));
  };

  const [importedCount, setImportedCount] = useState(0);

  const handleImport = async () => {
    if (programs.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      setImportedCount(programs.length);
      await onImport(programs);
      setStep('success');
      // Auto-close after showing success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import programs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setPrograms([]);
    setTextInput('');
    setError(null);
    onClose();
  };

  const handleBack = () => {
    setStep('upload');
    setPrograms([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">
            {step === 'upload' && 'Import Loyalty Programs'}
            {step === 'review' && 'Review & Edit Programs'}
            {step === 'success' && 'Complete'}
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && step === 'upload' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="mt-4 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                Analyzing your loyalty programs...
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                This may take a few seconds
              </p>
            </div>
          )}

          {step === 'upload' && !isLoading && (
            <div className="space-y-6">
              {/* Upload Section */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Upload Screenshot
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center transition-colors hover:border-blue-500 dark:border-zinc-600"
                >
                  <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Click to upload an image of your loyalty programs
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">PNG, JPG, WEBP up to 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-300 dark:border-zinc-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">or paste text</span>
                </div>
              </div>

              {/* Text Input Section */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Paste Your List
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={8}
                  placeholder="Paste your loyalty program list here...

Example:
Delta SkyMiles 123456789
United MileagePlus ABC123
Hilton Honors 987654321"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
                />
                <button
                  onClick={handleTextParse}
                  disabled={!textInput.trim() || isLoading}
                  className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Parsing...' : 'Parse Text'}
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Found {programs.length} program{programs.length !== 1 ? 's' : ''}.
                Edit any fields below before importing.
              </p>
              <ImportReviewTable
                programs={programs}
                onUpdate={handleUpdateProgram}
                onRemove={handleRemoveProgram}
              />
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
                Import Successful!
              </h3>
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                {importedCount} loyalty program{importedCount !== 1 ? 's' : ''} imported
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <div>
            {step === 'review' && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="text-sm text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                &larr; Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            {step === 'review' && (
              <button
                onClick={handleImport}
                disabled={programs.length === 0 || isLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Importing...' : `Import ${programs.length} Program${programs.length !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

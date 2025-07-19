"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
    cleanup();
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
    cleanup();
  };

  const cleanup = () => {
    setOptions(null);
    setResolvePromise(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      
      {/* Global Confirm Dialog */}
      <Dialog open={isOpen} onClose={handleCancel} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <DialogPanel className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
              {options?.title}
            </DialogTitle>
            <p className="text-gray-600 mb-6">{options?.message}</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  options?.confirmButtonClass || 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {options?.confirmText || 'Confirm'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {options?.cancelText || 'Cancel'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm(): ConfirmDialogContextType {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
} 
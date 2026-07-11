"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldAlert, Info, AlertTriangle } from "lucide-react";

type DialogOptions = {
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  confirmText?: string;
  cancelText?: string;
};

type DialogContextType = {
  alert: (options: DialogOptions) => Promise<void>;
  confirm: (options: DialogOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    isConfirm: boolean;
    options: DialogOptions;
    resolve: ((value: boolean | void) => void) | null;
  }>({
    isOpen: false,
    isConfirm: false,
    options: { title: "", message: "" },
    resolve: null,
  });

  const alert = (options: DialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setDialogState({ isOpen: true, isConfirm: false, options, resolve: resolve as any });
    });
  };

  const confirm = (options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({ isOpen: true, isConfirm: true, options, resolve });
    });
  };

  const handleClose = (result: boolean) => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (dialogState.resolve) {
      dialogState.resolve(result);
    }
  };

  const { isOpen, isConfirm, options } = dialogState;

  const Icon = 
    options.type === "success" ? CheckCircle2 :
    options.type === "error" ? ShieldAlert :
    options.type === "warning" ? AlertTriangle : Info;

  const iconColor = 
    options.type === "success" ? "text-emerald-600 bg-emerald-100" :
    options.type === "error" ? "text-red-600 bg-red-100" :
    options.type === "warning" ? "text-amber-600 bg-amber-100" : "text-blue-600 bg-blue-100";

  const confirmColor = 
    options.type === "error" || options.type === "warning" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90";

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => isConfirm ? handleClose(false) : handleClose(true)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-10 flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{options.title}</h3>
              <p className="text-slate-600 mb-6">{options.message}</p>
              
              <div className={`flex gap-3 w-full ${isConfirm ? 'flex-row' : 'flex-col'}`}>
                {isConfirm && (
                  <button
                    onClick={() => handleClose(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {options.cancelText || "বাতিল"}
                  </button>
                )}
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 text-white font-medium py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 ${confirmColor}`}
                >
                  {options.confirmText || (isConfirm ? "নিশ্চিত করুন" : "ঠিক আছে")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}

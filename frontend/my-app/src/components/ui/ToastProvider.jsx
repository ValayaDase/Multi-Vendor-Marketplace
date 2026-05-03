import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext({
  showToast: () => {},
});

const TOAST_EVENT = "vendorhub:toast";

let toastSequence = 0;

export function emitToast(message, type = "info") {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${toastSequence += 1}`,
        message: String(message || ""),
        type,
      },
    }),
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const originalAlertRef = useRef(null);

  useEffect(() => {
    const pushToast = (detail) => {
      if (!detail?.message) return;

      setToasts((current) => [...current, detail].slice(-5));

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== detail.id));
      }, 3500);
    };

    const onToast = (event) => pushToast(event.detail);

    originalAlertRef.current = window.alert;
    window.alert = (message) => {
      emitToast(message, "info");
    };

    window.addEventListener(TOAST_EVENT, onToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      if (originalAlertRef.current) {
        window.alert = originalAlertRef.current;
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      showToast: emitToast,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${
              toast.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

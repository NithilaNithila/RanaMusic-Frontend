import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const colors = {
    info: "bg-white/10",
    success: "bg-[#87CEEB] text-black",
    error: "bg-red-600",
  };

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md text-sm ${colors[type]}`}
    >
      {message}
    </div>
  );
}

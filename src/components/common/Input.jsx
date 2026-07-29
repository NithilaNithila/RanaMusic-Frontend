export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`bg-white/10 text-white placeholder-white/50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-brand ${className}`}
      {...props}
    />
  );
}

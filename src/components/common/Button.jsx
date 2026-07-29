export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "px-4 py-2 rounded-full font-medium text-sm transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-black hover:bg-green-400",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    ghost: "bg-transparent text-white hover:bg-white/10",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

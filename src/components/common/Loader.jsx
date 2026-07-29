export default function Loader({ size = "md" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex items-center justify-center py-6">
      <div
        className={`${sizes[size]} border-2 border-white/20 border-t-brand rounded-full animate-spin`}
      />
    </div>
  );
}

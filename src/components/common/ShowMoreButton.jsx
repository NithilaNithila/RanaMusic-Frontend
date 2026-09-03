import Button from "./Button.jsx";

export default function ShowMoreButton({ loading = false, onClick }) {
  return (
    <div className="mt-8 flex justify-center">
      <Button variant="trend" onClick={onClick} disabled={loading}>
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
            Loading
          </>
        ) : (
          <>
            Show More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </>
        )}
      </Button>
    </div>
  );
}

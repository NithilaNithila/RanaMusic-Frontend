import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center mt-24">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-white/50 mb-6">Page not found.</p>
      <Link to="/" className="text-brand">
        Go home
      </Link>
    </div>
  );
}

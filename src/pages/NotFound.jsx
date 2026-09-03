import { Link } from "react-router-dom";
import Button from "../components/common/Button.jsx";

export default function NotFound() {
  return (
    <div className="mt-20 text-center animate-fadeInUp sm:mt-28">
      <p className="font-display hero-gradient-text text-7xl font-bold tracking-tight sm:text-8xl">404</p>
      <h1 className="font-display mt-4 text-2xl font-semibold">This track doesn't exist</h1>
      <p className="mx-auto mt-2 max-w-xs text-sm text-black/50 dark:text-white/50">
        The page you're looking for was skipped, shuffled away, or never recorded.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}

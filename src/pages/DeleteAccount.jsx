import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function DeleteAccount() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-white dark:bg-brand-surface border border-black/10 dark:border-white/10 p-6">
        <h1 className="font-display mb-4 text-3xl font-semibold tracking-tight">Delete Your Account</h1>

        <div className="space-y-4 text-black/70 dark:text-white/70 text-sm leading-relaxed">
          <p>
            You can permanently delete your RanaMusic account at any time. Deleting your
            account removes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your profile (username, email)</li>
            <li>All of your playlists</li>
            <li>Your liked songs</li>
            <li>Your listening history</li>
          </ul>
          <p className="text-red-600 dark:text-red-300">
            This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="mt-6">
          {user ? (
            <Link
              to="/profile"
              className="inline-block rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
            >
              Go to account deletion
            </Link>
          ) : (
            <div className="space-y-3">
              <p className="text-black/50 dark:text-white/50 text-xs">
                You are not signed in. Log in with the account you want to delete, then
                open Profile and tap "Delete account".
              </p>
              <Link
                to="/login"
                className="inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                Log in
              </Link>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-black/40 dark:text-white/40">
          Need help? Contact us via the{" "}
          <Link to="/contact" className="text-brand underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

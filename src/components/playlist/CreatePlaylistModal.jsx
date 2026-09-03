import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "../common/Modal.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { createPlaylist } from "../../api/playlistApi";
import { LANGUAGES } from "../../context/LanguageContext";

const GlobeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LockIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function CreatePlaylistModal({ open, onClose, onCreated, initialName = "" }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [language, setLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      setDirection(1);
      setName(initialName || "");
      setIsPublic(false);
      setLanguage("hi");
      setError("");
    }
  }, [open, initialName]);

  const goNext = () => {
    if (!name.trim()) return;
    setError("");
    setDirection(1);
    setStep(2);
  };

  const goBack = () => {
    setError("");
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!language) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await createPlaylist({
        name: name.trim(),
        isPublic,
        language,
      });
      onCreated?.(data);
      setName("");
      setIsPublic(false);
      setLanguage("hi");
      setStep(1);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={step === 1 ? "New Playlist" : "Choose Language"}>
      <div className="relative mb-4 flex items-center gap-2">
        <span
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            step >= 1 ? "bg-brand" : "bg-black/10 dark:bg-white/10"
          }`}
        />
        <span
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            step >= 2 ? "bg-brand" : "bg-black/10 dark:bg-white/10"
          }`}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.form
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
            className="flex flex-col gap-4"
          >
            <Input
              autoFocus
              placeholder="Playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Visibility toggle */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
                Visibility
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-200 ${
                    isPublic
                      ? "border-brand bg-brand/10"
                      : "border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]"
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isPublic ? "text-brand" : "text-black/50 dark:text-white/50"}`}>
                    {GlobeIcon}
                  </span>
                  <span className="text-sm font-semibold">Public</span>
                  <span className="text-[11px] leading-snug text-black/45 dark:text-white/45">
                    Everyone can see this playlist
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-200 ${
                    !isPublic
                      ? "border-brand bg-brand/10"
                      : "border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]"
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${!isPublic ? "text-brand" : "text-black/50 dark:text-white/50"}`}>
                    {LockIcon}
                  </span>
                  <span className="text-sm font-semibold">Private</span>
                  <span className="text-[11px] leading-snug text-black/45 dark:text-white/45">
                    Only you can see this playlist
                  </span>
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button type="submit" disabled={!name.trim()}>
              Next
            </Button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-black/50 dark:text-white/50">
              Which language suits this playlist?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                    language === l.code
                      ? "border-brand bg-brand/10"
                      : "border-black/10 bg-black/[0.03] hover:border-black/20 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold leading-tight">{l.label}</span>
                    <span className="block truncate text-[11px] text-black/45 dark:text-white/45">{l.native}</span>
                  </span>
                </button>
              ))}
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-2.5">
              <Button type="button" variant="secondary" onClick={goBack}>
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
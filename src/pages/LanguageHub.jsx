import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LANGUAGES } from "../context/LanguageContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 34, scale: 0.88 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

const nameSize = {
  en: "text-4xl md:text-6xl",
  hi: "text-4xl md:text-7xl",
  ta: "text-3xl md:text-7xl",
  te: "text-3xl md:text-7xl",
  ml: "text-3xl md:text-7xl",
  kn: "text-3xl md:text-7xl",
};

function LanguageCard({ meta }) {
  return (
    <motion.div variants={item} whileHover="hover" whileTap="tap" className="h-full">
      <Link
        to={`/languages/${meta.code}`}
        className="group relative flex h-full min-h-48 flex-col items-center justify-center overflow-hidden rounded-3xl border border-black/10 bg-white px-4 py-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/25 dark:border-white/10 dark:bg-brand-surface lg:min-h-72 lg:p-14">
        {/* Glow blobs that bloom on hover */}
        <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/20 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-brand/35" />
        <span className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-brand-300/20 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-brand-300/40 dark:bg-brand-300/10" />

        {/* Shine sweep across the card */}
        <span className="pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%] dark:via-white/10" />

        {/* Label */}
        <h3 className={`${nameSize[meta.code] || nameSize.hi} font-bold tracking-tight leading-none`}>
          {meta.native}
        </h3>
      </Link>
    </motion.div>
  );
}

export default function LanguageHub() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Browse by language
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-black/50 dark:text-white/50 md:text-base">
          Pick a language and dive into its trending songs, fresh albums and rising artists.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 md:gap-8"
      >
        {LANGUAGES.map((l) => (
          <LanguageCard key={l.code} meta={l} />
        ))}
      </motion.div>
    </div>
  );
}
import { createContext, useContext, useEffect, useState } from "react";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

const LanguageContext = createContext({ language: "hi", setLanguage: () => {} });

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "hi";
  const stored = window.localStorage.getItem("language");
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  return "hi";
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem("language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
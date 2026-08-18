import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
];

export function LanguageToggle() {
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm">
      {languages.map((lang) => {
        const active = i18n.language === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleChangeLanguage(lang.code)}
            aria-label={t(`language.${lang.code === "en" ? "english" : lang.code === "es" ? "spanish" : "french"}`)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-all ${
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
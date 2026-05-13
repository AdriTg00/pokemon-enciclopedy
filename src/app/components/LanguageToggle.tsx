import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">
        {t("language.label")}
      </span>

      <select
        value={i18n.language}
        onChange={(event) => handleChangeLanguage(event.target.value)}
        className="rounded-full border border-border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm transition-colors hover:bg-accent"
      >
        <option value="en">{t("language.english")}</option>
        <option value="es">{t("language.spanish")}</option>
        <option value="fr">{t("language.french")}</option>
      </select>
    </div>
  );
}
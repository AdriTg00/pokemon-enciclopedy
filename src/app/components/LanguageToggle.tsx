import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <select
      value={i18n.language}
      onChange={(event) => handleChangeLanguage(event.target.value)}
      className="rounded-full border border-border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm transition-colors hover:bg-accent"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
    </select>
  );
}
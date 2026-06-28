import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground shadow-sm transition-colors hover:bg-accent"
    >
      {theme === "dark" ? `☀️ ${t("theme.light")}` : `🌙 ${t("theme.dark")}`}
    </button>
  );
}
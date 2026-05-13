import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleClick = () => {
    console.log("Before click theme:", theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground shadow-sm transition-colors hover:bg-accent"
    >
      {theme === "dark" ? `☀️ ${t("theme.light")}` : `🌙 ${t("theme.dark")}`}
    </button>
  );
}
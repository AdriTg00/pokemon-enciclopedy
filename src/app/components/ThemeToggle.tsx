import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? t("theme.light") : t("theme.dark")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:bg-accent hover:scale-105 active:scale-95"
    >
      {isDark ? (
        <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      ) : (
        <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      )}
    </button>
  );
}
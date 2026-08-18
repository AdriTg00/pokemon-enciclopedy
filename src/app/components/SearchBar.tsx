import { Search, X } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useTranslation();
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
      <Input
        type="text"
        placeholder={t("app.searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-11 sm:pl-12 pr-11 sm:pr-12 h-11 sm:h-12 rounded-full border-muted bg-card/80 shadow-sm focus:bg-card transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t('app.clearSearch', { defaultValue: 'Clear search' })}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}
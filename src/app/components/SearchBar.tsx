import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
      <Input
        type="text"
        placeholder="Search Pokémon..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 sm:pl-12 h-10 sm:h-12 rounded-full border-2 border-gray-200 focus:border-blue-400 transition-colors text-sm sm:text-base"
      />
    </div>
  );
}
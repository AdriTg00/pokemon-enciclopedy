import { POKEMON_TYPE_COLORS } from '@/config/constants';

export function getPokemonTypeColor(type: string): string {
  return POKEMON_TYPE_COLORS[type.toLowerCase()] || '#A8A878';
}

export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}

export function formatPokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatHeight(height: number): string {
  const meters = height / 10;
  return `${meters.toFixed(1)} m`;
}

export function formatWeight(weight: number): string {
  const kilograms = weight / 10;
  return `${kilograms.toFixed(1)} kg`;
}

export function formatAbilityName(ability: string): string {
  return ability
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getStatColor(stat: number): string {
  if (stat >= 150) return 'text-green-600';
  if (stat >= 100) return 'text-blue-600';
  if (stat >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

export function getStatBarColor(stat: number): string {
  if (stat >= 150) return 'bg-green-500';
  if (stat >= 100) return 'bg-blue-500';
  if (stat >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

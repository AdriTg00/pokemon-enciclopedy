
# PokéDex App

Modern Pokemon encyclopedia built with React, TypeScript, and Tailwind CSS. Browse, search, and explore detailed information about Pokemon from all generations.

## Features

- Browse Pokemon from all generations (1-9)
- Advanced search by name or ID
- Filter by type and generation
- Detailed Pokemon stats and information
- Responsive design for all devices
- Smooth animations and transitions
- Fast loading with optimized API calls

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- PokéAPI

## Getting Started

### Prerequisites

- Node.js 16+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── app/
│   ├── components/     # React components
│   │   ├── ui/        # Reusable UI components
│   │   ├── PokemonCard.tsx
│   │   ├── PokemonDetail.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterSection.tsx
│   └── App.tsx        # Main application
├── styles/            # CSS styles
└── main.tsx          # Entry point
```

## API

This project uses the [PokéAPI](https://pokeapi.co/) for Pokemon data.

## License

MIT

## Acknowledgments

- [PokéAPI](https://pokeapi.co/) for Pokemon data
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## To sync with Android Studio
npm install @capacitor/android
npm run build
npx cap add android
npx cap sync android
npx cap open android
  
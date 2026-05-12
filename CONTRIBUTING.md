# Contributing to PokéDex App

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Code Style

- Use TypeScript for all new files
- Follow existing code patterns
- Use meaningful variable and function names
- Keep components small and focused
- Extract reusable logic into custom hooks or utilities

## Component Guidelines

- Create new components in `src/app/components/`
- Use Radix UI primitives for accessible UI components
- Keep styling with Tailwind CSS classes
- Ensure mobile responsiveness

## File Structure

```
src/
├── app/
│   ├── components/    # React components
│   └── App.tsx       # Main app component
├── config/           # Configuration constants
├── services/         # API services
├── types/            # TypeScript types
├── utils/            # Utility functions
└── styles/           # Global styles
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Create a pull request with a clear description
5. Wait for review

## Reporting Bugs

Please create an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Feature Requests

Open an issue describing:
- The feature
- Why it would be useful
- How it should work

Thank you for contributing!

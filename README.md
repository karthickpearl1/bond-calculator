# Bond Return Calculator

A comprehensive React-based web application for analyzing bond investment returns through XIRR calculations across different exit scenarios and sale prices.

## Features

- **Bond Investment Analysis**: Calculate returns for various exit years and sale prices
- **XIRR Calculations**: Accurate annualized return calculations using Newton-Raphson method
- **Interactive Matrix View**: Visual comparison of returns across all scenarios
- **Real-time Updates**: Automatic recalculation when inputs change
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Static Deployment**: No backend required, deployable anywhere

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

This application can be deployed to any static hosting platform. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions for:

- Vercel (recommended)
- Netlify
- GitHub Pages
- Other static hosts

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **CSS Modules** for component styling
- **Custom XIRR Implementation** using Newton-Raphson method

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

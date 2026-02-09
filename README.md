# Student Hub

A modern React 18 single-page application for international students, built with Vite and Tailwind CSS.

## Project Overview

This application will serve as a comprehensive guide for international students through their journey from choosing a university to settling into their community. For now, it features a responsive header component.

## Features

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Responsive Design** - mobile-friendly header with adaptive navigation
- **Accessible UI** - semantic HTML, ARIA labels, and focus styles
- **Modern Aesthetics** - blue gradient color palette with rounded corners

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Local Development with Amplify Auth

For full local development with authentication:

```bash
# Terminal 1: Start Amplify sandbox (generates amplify_outputs.json)
npm run sandbox

# Terminal 2: Start Vite dev server
npm run dev
```

**See [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md) for detailed setup instructions and troubleshooting.**

If you don't want to run sandbox, generate configuration once:

```bash
npm run amplify:outputs
```

### Backend Commands

- `npm run sandbox` - Start Amplify Gen 2 sandbox (local AWS services)
- `npm run amplify:outputs` - Generate runtime configuration from backend

### Build

```bash
npm run build
```

### Preview

```bash
npm preview
```

## Project Structure

```
src/
├── components/
│   └── Header.tsx      # Responsive header component
├── App.tsx             # Main app component
├── index.css           # Tailwind CSS directives
└── main.tsx            # Entry point
```

## Future Features

- University selection guide
- Housing exploration
- Community networking
- Student profiles and connections

## License

MIT

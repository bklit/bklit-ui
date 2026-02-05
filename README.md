![hero](https://github.com/bklit/bklit-ui/blob/main/apps/web/app/opengraph-image.png?raw=true)

<p align="center">
	<h1 align="center"><b>Bklit UI</b></h1>
<p align="center">
    A collection of Open Source charts and utility components that you can customize and extend.
    <br />
    <br />
    <a href="https://ui.bklit.com">Docs</a>
    ·
    <a href="https://x.com/bklitai">X.com</a>
    ·
    <a href="https://discord.gg/9yyK8FwPcU">Discord</a>
    ·
    <a href="https://github.com/bklit/bklit-ui/issues">Issues</a>
  </p>
</p>

### [→ Demo](https://ui.bklit.com)

## About

Bklit UI is a modern, open-source component library featuring beautiful charts and utility components built with React 19 and Tailwind CSS 4. Designed for developers who need flexible, customizable UI components with minimal setup.

## Features

- 📊 **Beautiful Charts** - Powered by Visx for data visualization
- 🎨 **Modern Styling** - Built with Tailwind CSS 4
- ⚡ **Latest Tech** - React 19 and Next.js 15
- 🎭 **Smooth Animations** - Integrated Motion library
- 📦 **Monorepo Setup** - Turborepo + pnpm workspace
- 🔧 **Fully Customizable** - Extend and modify components to fit your needs
- 📚 **Great Documentation** - Powered by Fumadocs

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher
- **pnpm**: v9.0.0 (install with `npm install -g pnpm@9.0.0`)

## Getting Started

### Installation

1. **Fork and clone the repository**:
```bash
git clone https://github.com/YOUR_USERNAME/bklit-ui.git
cd bklit-ui
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Start the development server**:
```bash
cd apps/web && pnpm dev
```

The documentation site will be available at `http://localhost:3000`.

## Project Structure

```
bklit-ui/
├── apps/
│   └── web/          # Documentation site (Next.js + Fumadocs)
└── packages/
    └── ui/           # Component library
```

## Tech Stack

- **Framework**: Next.js 15
- **Components**: React 19
- **Styling**: Tailwind CSS 4
- **Charts**: Visx
- **Animation**: Motion
- **Docs**: Fumadocs
- **Monorepo**: Turborepo + pnpm
- **Linter**: Ultracite

## Development

### Available Scripts

Run these commands from the root directory:

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Check code with Ultracite linter
- `pnpm format` - Format code with Ultracite
- `pnpm check-types` - Run TypeScript type checking

### Building

Build the entire project:
```bash
pnpm build
```

Build specific packages:
```bash
cd packages/ui && pnpm build
cd apps/web && pnpm build
```

## Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository** to your own GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bklit-ui.git
   ```
3. **Create a new branch** for your changes:
   ```bash
   git checkout -b your-branch-name
   ```
4. **Make your changes** and test thoroughly
5. **Lint and format** your code:
   ```bash
   pnpm lint
   pnpm format
   ```
6. **Commit your changes** with a clear, descriptive message
7. **Push to your fork**:
   ```bash
   git push origin your-branch-name
   ```
8. **Open a Pull Request** with a clear title and description
   - Describe what your PR does and why
   - Tag [@uixmat](https://github.com/uixmat) for review
   - Reference any related issues

### Code Quality

- Run `pnpm lint` before committing to catch issues
- Run `pnpm format` to ensure consistent code style
- Use descriptive variable and function names
- Add comments for complex logic

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/bklit/bklit-ui/issues) with:

- **Clear title** describing the issue
- **Detailed description** of the problem or feature
- **Steps to reproduce** (for bugs)
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser, etc.)

## Getting Help

- 💬 Join our [Discord community](https://discord.gg/9yyK8FwPcU)
- 📖 Check the [documentation](https://ui.bklit.com)
- 🐦 Follow us on [X/Twitter](https://x.com/bklitai)
- 🐛 Report bugs via [GitHub Issues](https://github.com/bklit/bklit-ui/issues)

## Repo Activity

![Alt](https://repobeats.axiom.co/api/embed/c591b93fd9e7bfa8f4dc8bddb716699615ee5fde.svg "Repobeats analytics image")

## License

MIT © [Bklit](https://github.com/bklit)

---

<p align="center">Made with ❤️ by the Bklit team</p>

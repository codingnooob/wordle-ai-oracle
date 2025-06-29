
# Development Setup Guide

## 🔧 Environment Setup

### Required Tools
- **Node.js 18+** and npm
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense

### Supabase Setup
1. **Create a Supabase project**
2. **Copy your project URL and keys**
3. **Add to `.env.local`**:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
4. **Deploy edge functions** (if contributing to backend):
   ```bash
   supabase functions deploy
   ```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - for enhanced ML features
OPENAI_API_KEY=your_openai_api_key

# Development Configuration
VITE_DEV_MODE=true
VITE_DEBUG_LOGGING=true
```

## 🚀 Getting Started

1. **Clone and install**:
   ```bash
   git clone https://github.com/yourusername/wordle-ai-oracle.git
   cd wordle-ai-oracle
   npm install
   ```

2. **Start development**:
   ```bash
   npm run dev
   ```

3. **Run tests**:
   ```bash
   npm run test
   npm run test:watch
   npm run test:coverage
   ```

## 🛠️ Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript checks

## 🔍 Debugging

- Use browser dev tools for frontend debugging
- Check console logs for ML processing flow
- Use Supabase dashboard for backend debugging
- Enable debug logging with `VITE_DEBUG_LOGGING=true`

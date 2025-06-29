
# Quick Start Guide

## 🚀 Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend services)
- Git

## ⚡ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/wordle-ai-oracle.git
cd wordle-ai-oracle
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
cp .env.example .env.local
```

### 4. Configure environment variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key  # Optional for enhanced ML features
```

### 5. Start development server
```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 🎮 Basic Usage

### Solving Wordle Puzzles
1. **Select word length** (default: 5 letters)
2. **Enter your guesses** as you make them in Wordle
3. **Mark constraints**: Green (correct), Yellow (wrong position), Grey (not in word)
4. **Get AI suggestions** ranked by probability
5. **Analyze patterns** with ML insights

### Advanced Features
- **Real-time Analysis**: Watch as the AI learns from your constraints
- **Corpus Training**: Enable dynamic vocabulary expansion
- **Security Mode**: Enhanced input validation for production use
- **Debug Mode**: Detailed logging for development

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for enhanced ML | No |
| `NODE_ENV` | Environment (development/production) | Auto |

### Customization Options
- **Word lengths**: 3-15 letters supported
- **ML models**: Configurable Hugging Face models
- **Security levels**: Adjustable validation strictness
- **UI themes**: Built-in dark/light mode support

## 🧪 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite
- `npm run lint` - Code linting
- `npm run type-check` - TypeScript validation

## 🚀 Next Steps

- **Read the [Features Guide](FEATURES.md)** to understand all capabilities
- **Check out [Self-Hosting Guide](SELF_HOSTING.md)** for deployment options
- **Review [Architecture Overview](ARCHITECTURE.md)** for technical details
- **See [API Guide](API_GUIDE.md)** for integration options
- **Visit [Contributing Guidelines](CONTRIBUTING.md)** to get involved

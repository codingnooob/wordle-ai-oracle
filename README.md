
# Wordle AI Oracle 🎯

An advanced AI-powered Wordle solver that combines machine learning, constraint analysis, and dynamic word corpus generation to provide intelligent word suggestions and real-time game analysis.

![Wordle AI Oracle Demo](https://wordle-ai-oracle.lovable.app/)

## ✨ Key Features

- 🧠 **Advanced AI Analysis** - Real-time ML training with 145K+ word corpus
- 🔒 **Enterprise Security** - Comprehensive input validation and rate limiting
- 🌐 **Dynamic Word Corpus** - Real-time word collection and quality filtering
- 🎮 **Interactive Interface** - Modern, responsive UI with real-time feedback
- 🔌 **REST API** - Powerful API for external integrations
- 🚀 **High Performance** - Optimized for speed and scalability

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/wordle-ai-oracle.git
cd wordle-ai-oracle
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Start development
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in minutes
- **[Features Overview](docs/FEATURES.md)** - Comprehensive feature descriptions
- **[API Guide](docs/API_GUIDE.md)** - Complete API documentation with examples
- **[Self-Hosting Guide](docs/SELF_HOSTING.md)** - Deploy your own instance
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Technical system design
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase with Edge Functions, PostgreSQL
- **AI/ML**: Hugging Face Transformers, Custom ML Pipeline
- **Deployment**: Vercel/Netlify ready, Docker support

## 🔌 API Integration

Transform any application into a Wordle solver with our REST API:

```javascript
const response = await fetch('https://wordlesolver.ai/api/wordle-solver', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guessData: [
      { letter: 'C', state: 'absent' },
      { letter: 'R', state: 'present' },
      // ... more constraints
    ],
    wordLength: 5
  })
});

const { solutions } = await response.json();
console.log(solutions); // [{ word: "AROSE", probability: 85.2 }, ...]
```

See the [API Guide](docs/API_GUIDE.md) for complete documentation.

## 🌟 Live Demo

**Try it now**: [https://wordly-ai-oracle.lovable.app](https://wordly-ai-oracle.lovable.app/)

## 🤝 Contributing

We welcome contributions! See our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code standards and best practices
- Submitting issues and pull requests
- Testing requirements

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3). See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://wordly-ai-oracle.lovable.app](https://wordly-ai-oracle.lovable.app/)
- **API Documentation**: [https://wordlesolver.ai/api-docs](https://wordlesolver.ai/api-docs)
- **Issues**: [GitHub Issues](https://github.com/codingnooob/wordle-ai-oracle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/codingnooob/wordle-ai-oracle/discussions)

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies and AI. Special thanks to:
- **Wordle** by Josh Wardle for the original game concept
- **Hugging Face** for transformer models
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful UI components

---

**📊 Stats**: 145K+ words • Real-time ML • Enterprise Security • Open Source AGPLv3

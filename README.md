
# Wordly AI Oracle 🎯

An advanced AI-powered Wordle solver that combines machine learning, constraint analysis, and dynamic word corpus generation to provide intelligent word suggestions and real-time game analysis.

![Wordly AI Oracle Demo][https://wordly-ai-oracle.lovable.app/](https://wordly-ai-oracle.lovable.app/)

## 🚀 Features

### 🧠 Advanced AI Analysis
- **Real-time ML Training**: Dynamic model training with 145K+ word corpus
- **Constraint Validation**: Intelligent analysis of Wordle constraints (green/yellow/grey tiles)
- **Probability Scoring**: Advanced algorithms to rank word suggestions by likelihood
- **Pattern Recognition**: ML-powered pattern analysis for optimal guess selection

### 🔒 Enterprise Security
- **Input Sanitization**: Comprehensive input validation and sanitization
- **Rate Limiting**: Built-in protection against abuse
- **Secure Logging**: Environment-aware logging with sensitive data protection
- **XSS Prevention**: Advanced security measures for web scraping and user input

### 🌐 Dynamic Word Corpus
- **Web Scraping**: Real-time word collection from multiple sources
- **Quality Filtering**: ML-powered word validation and quality assessment
- **Corpus Expansion**: Continuous vocabulary expansion with 145K+ words
- **Fallback Systems**: Robust fallback mechanisms for reliable operation

### 🎮 Interactive Interface
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS
- **Real-time Feedback**: Instant visual feedback for constraint states
- **Word Length Support**: Configurable word lengths (3-15 letters)
- **Keyboard Integration**: Interactive virtual keyboard with constraint visualization

## 🔌 API Access

### REST API Endpoints

The Wordly AI Oracle provides a powerful REST API for integrating Wordle solving capabilities into your applications.

**Base URL**: `https://wordlesolver.ai/api`

#### POST /wordle-solver
Analyze Wordle guesses and get AI-powered word predictions.

**Request Body:**
```json
{
  "guessData": [
    { "letter": "H", "state": "correct" },
    { "letter": "O", "state": "present" },
    { "letter": "U", "state": "absent" },
    { "letter": "S", "state": "correct" },
    { "letter": "E", "state": "unknown" }
  ],
  "wordLength": 5,
  "excludedLetters": ["B", "C", "D"],
  "apiKey": "optional-api-key"
}
```

**Response:**
```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "complete",
  "solutions": [
    { "word": "HOUSE", "probability": 85.2 },
    { "word": "HORSE", "probability": 78.9 }
  ],
  "confidence_score": 0.95,
  "processing_status": "complete"
}
```

#### GET /wordle-solver/status/{job_id}
Check the status of async analysis jobs.

### Code Examples

**JavaScript/Node.js:**
```javascript
const response = await fetch('https://wordlesolver.ai/api/wordle-solver', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key' // optional
  },
  body: JSON.stringify({
    guessData: [
      { letter: 'H', state: 'correct' },
      { letter: 'O', state: 'present' },
      { letter: 'U', state: 'absent' }
    ],
    wordLength: 5
  })
});

const result = await response.json();
console.log('Solutions:', result.solutions);
```

**Python:**
```python
import requests

response = requests.post('https://wordlesolver.ai/api/wordle-solver', json={
    'guessData': [
        {'letter': 'H', 'state': 'correct'},
        {'letter': 'O', 'state': 'present'},
        {'letter': 'U', 'state': 'absent'}
    ],
    'wordLength': 5
})

result = response.json()
print('Solutions:', result['solutions'])
```

**cURL:**
```bash
curl -X POST 'https://wordlesolver.ai/api/wordle-solver' \
  -H 'Content-Type: application/json' \
  -d '{
    "guessData": [
      {"letter": "H", "state": "correct"},
      {"letter": "O", "state": "present"}
    ],
    "wordLength": 5
  }'
```

### API Features
- **Rate Limiting**: 100 requests per hour per API key/IP
- **Async Processing**: Long-running analyses return job IDs for status checking
- **Multiple Response Modes**: Immediate results (< 10s) or async processing
- **Letter States**: Support for correct, present, absent, and unknown letter states
- **Word Length Support**: Configurable word lengths from 3-15 letters

### API Documentation
For complete API documentation with interactive examples, visit: [https://wordlesolver.ai/api-docs](https://wordlesolver.ai/api-docs)

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **ML/AI**: Hugging Face Transformers (@huggingface/transformers)
- **Backend**: Supabase with Edge Functions
- **State Management**: TanStack Query
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify ready

## 🏗️ Architecture

### Core Components
- **RealMLAnalyzer**: Advanced ML analysis engine
- **WordGenerator**: AI-powered word suggestion system
- **ConstraintValidator**: Intelligent constraint validation
- **SecurityUtils**: Comprehensive security layer
- **WebScrapingService**: Dynamic corpus expansion

### ML Pipeline
1. **Data Collection**: Web scraping from multiple sources
2. **Quality Assessment**: ML-powered word validation
3. **Corpus Training**: Real-time model training
4. **Constraint Analysis**: Pattern recognition and scoring
5. **Suggestion Generation**: Probability-based word ranking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend services)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wordly-ai-oracle.git
cd wordly-ai-oracle
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key  # Optional for enhanced ML features
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 🏢 Self-Hosting Guide

### Option 1: Vercel Deployment

1. **Connect your repository to Vercel**
2. **Configure environment variables in Vercel dashboard**
3. **Deploy with automatic builds**

```bash
# Optional: Use Vercel CLI
npm i -g vercel
vercel --prod
```

### Option 2: Netlify Deployment

1. **Connect repository to Netlify**
2. **Set build command**: `npm run build`
3. **Set publish directory**: `dist`
4. **Configure environment variables**

### Option 3: Manual Server Deployment

```bash
# Build the application
npm run build

# Serve the dist folder with your preferred web server
# Example with nginx, apache, or serve
npx serve -s dist -l 3000
```

### Supabase Setup

1. **Create a new Supabase project**
2. **Set up the database schema** (if using custom tables)
3. **Deploy edge functions**:
```bash
supabase functions deploy analyze-wordle
supabase functions deploy web-scraper
```
4. **Configure secrets**:
```bash
supabase secrets set OPENAI_API_KEY=your_key
```

### Docker Deployment (Advanced)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
```

## 🎮 Usage

### Basic Wordle Solving
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

### Customization

The application supports extensive customization:
- **Word lengths**: 3-15 letters supported
- **ML models**: Configurable Hugging Face models
- **Security levels**: Adjustable validation strictness
- **UI themes**: Built-in dark/light mode support

## 🧪 Development

### Project Structure
```
src/
├── components/          # React components
├── utils/              # Utility functions
├── ml/                 # ML services and models
├── security/           # Security utilities
├── integrations/       # External service integrations
└── pages/              # Application pages
```

### Key Files
- `src/utils/ml/realMLAnalyzer.ts` - Core ML analysis engine
- `src/utils/security/securityUtils.ts` - Security layer
- `src/components/WordInput.tsx` - Main input component
- `supabase/functions/` - Edge functions for backend processing

### Testing
```bash
npm run test          # Run test suite
npm run test:coverage # Coverage report
npm run lint          # Code linting
npm run type-check    # TypeScript validation
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3). See the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ You can use, modify, and distribute this software
- ✅ You can use it for commercial purposes
- ❗ You must provide source code for any network use
- ❗ Any modifications must also be AGPLv3 licensed
- ❗ You must include license and copyright notices

## 🔗 Links

- **Live Demo**: [https://wordly-ai-oracle.lovable.app](https://wordly-ai-oracle.lovable.app/)
- **API Documentation**: [https://wordlesolver.ai/api-docs](https://wordlesolver.ai/api-docs)
- **Issues**: [GitHub Issues](https://github.com/codingnooob/wordly-ai-oracle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/codingnooob/wordly-ai-oracle/discussions)

## 🙏 Acknowledgments

- **Wordle** by Josh Wardle for the original game concept
- **Hugging Face** for the transformer models
- **Supabase** for the backend infrastructure
- **Vercel** for hosting and deployment
- **shadcn/ui** for the beautiful UI components

## 📊 Stats

- **145,000+** words in dynamic corpus
- **Real-time** ML training and analysis
- **Enterprise-grade** security implementation
- **Mobile-first** responsive design
- **Open source** AGPLv3 licensed

---

**Built with ❤️ and AI** - Showcasing the power of modern web development, machine learning, and open source collaboration.

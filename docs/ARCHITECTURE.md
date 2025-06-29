
# Architecture Overview

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Supabase Edge  │    │   ML Services   │
│   (Frontend)    │◄──►│   Functions     │◄──►│  (Hugging Face) │
│                 │    │   (Backend)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Tailwind CSS  │    │   PostgreSQL    │    │  Word Corpus    │
│   + shadcn/ui   │    │   Database      │    │   (145K+ words) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with full type coverage
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library built on Radix UI
- **TanStack Query**: Data fetching and state management
- **React Router**: Client-side routing

### Backend Technologies
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Relational database with advanced features
- **Edge Functions**: Serverless functions for API endpoints
- **Row Level Security**: Database-level security policies

### AI/ML Technologies
- **Hugging Face Transformers**: Pre-trained ML models
- **Custom ML Pipeline**: Word analysis and prediction algorithms
- **Dynamic Corpus**: Real-time word collection and validation
- **Probability Scoring**: Statistical analysis for word ranking

## 🔄 Data Flow Architecture

### 1. User Input Processing
```
User Input → Validation → Sanitization → Constraint Analysis
     ↓
Security Checks → Rate Limiting → API Gateway
```

### 2. ML Analysis Pipeline
```
Constraints → ML Model → Word Generation → Probability Scoring
     ↓              ↓           ↓              ↓
Pattern Analysis → Training → Corpus Query → Result Ranking
```

### 3. Response Generation
```
ML Results → Formatting → Caching → API Response
     ↓           ↓          ↓          ↓
Logging → Monitoring → Analytics → User Display
```

## 🧠 ML Architecture

### Core Components

#### RealMLAnalyzer
- **Purpose**: Advanced ML analysis engine
- **Features**: Real-time training, pattern recognition, constraint validation
- **Models**: Transformer-based models for word prediction

#### WordGenerator
- **Purpose**: AI-powered word suggestion system
- **Features**: Dynamic corpus integration, quality filtering
- **Output**: Ranked word suggestions with probability scores

#### ConstraintValidator
- **Purpose**: Intelligent constraint validation
- **Features**: Conflict detection, pattern matching, state validation
- **Integration**: Real-time feedback to user interface

### ML Pipeline Stages

1. **Data Collection**
   - Web scraping from multiple sources
   - Quality assessment and filtering
   - Corpus expansion and maintenance

2. **Model Training**
   - Real-time model updates
   - User interaction learning
   - Performance optimization

3. **Prediction Generation**
   - Constraint-based filtering
   - Probability calculation
   - Result ranking and scoring

4. **Response Optimization**
   - Caching frequently requested analyses
   - Result compression and formatting
   - Performance monitoring

## 🔒 Security Architecture

### Security Layers

#### Input Security
- **Validation**: Comprehensive input validation using Zod schemas
- **Sanitization**: XSS prevention and input cleaning
- **Rate Limiting**: Request throttling per IP/API key
- **Authentication**: API key validation and user identification

#### Application Security
- **CSP Headers**: Content Security Policy enforcement
- **CORS Configuration**: Cross-origin request management
- **HTTPS Enforcement**: Secure communication protocols
- **Error Handling**: Secure error messages without data leakage

#### Database Security
- **Row Level Security**: Supabase RLS policies
- **Connection Security**: Encrypted database connections
- **Access Control**: Role-based permissions
- **Audit Logging**: Security event tracking

### Security Utils Implementation
```typescript
// Example security validation
export function validateWordleInput(input: unknown): WordleInput {
  return wordleInputSchema.parse(input);
}

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input.trim());
}

export function checkRateLimit(identifier: string): boolean {
  return rateLimiter.check(identifier);
}
```

## 📊 Performance Architecture

### Frontend Performance
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Memoization**: React.memo and useMemo for expensive calculations
- **Bundle Optimization**: Tree shaking and minification

### Backend Performance
- **Edge Functions**: Global distribution for low latency
- **Database Optimization**: Proper indexing and query optimization
- **Caching Strategy**: Multi-level caching (browser, CDN, server)
- **Connection Pooling**: Efficient database connection management

### ML Performance
- **Model Caching**: Pre-loaded models for faster inference
- **Batch Processing**: Efficient batch operations for multiple requests
- **Result Caching**: Cached analysis results for common patterns
- **Async Processing**: Non-blocking ML operations

## 🔧 Component Architecture

### React Component Hierarchy
```
App
├── Header
├── WordInput
│   ├── WordLengthSelector
│   ├── GuessGrid
│   │   └── LetterTile[]
│   └── Keyboard
├── AnalysisControls
├── SolutionsList
├── MLStatusIndicator
└── Footer
```

### Custom Hooks
- **useMLStatus**: ML processing status management
- **useWordAnalysis**: Wordle analysis logic
- **useLocalStorage**: Browser storage persistence
- **useDebounce**: Input debouncing for performance

### Utility Organization
```typescript
utils/
├── ml/                 # Machine learning utilities
│   ├── realMLAnalyzer.ts
│   ├── wordGenerator.ts
│   └── constraintValidator.ts
├── security/           # Security utilities
│   └── securityUtils.ts
├── constraints/        # Wordle constraint logic
│   ├── analyzer.ts
│   ├── validator.ts
│   └── types.ts
└── api/               # API integration
    └── wordApiService.ts
```

## 📡 API Architecture

### RESTful API Design
- **Resource-based URLs**: `/api/wordle-solver`, `/api/status/{id}`
- **HTTP Methods**: POST for analysis, GET for status checks
- **Status Codes**: Proper HTTP status code usage
- **Error Responses**: Consistent error message format

### Request/Response Flow
```typescript
// Request validation
POST /api/wordle-solver
{
  "guessData": [...],
  "wordLength": 5,
  "excludedLetters": [...]
}

// Response format
{
  "job_id": "uuid",
  "status": "complete",
  "solutions": [...],
  "confidence_score": 0.95
}
```

### Async Processing
- **Job Queue**: Background processing for complex analyses
- **Status Polling**: Real-time status updates
- **WebSocket Support**: Live analysis updates (future enhancement)

## 🚀 Deployment Architecture

### Build Pipeline
1. **Development**: Local development with hot reloading
2. **Testing**: Automated test suite execution
3. **Building**: Production build with optimization
4. **Deployment**: Automated deployment to hosting platform

### Infrastructure
- **Static Hosting**: CDN-distributed static assets
- **Serverless Functions**: Edge functions for API endpoints
- **Database**: Managed PostgreSQL with automatic scaling
- **Monitoring**: Comprehensive monitoring and error tracking

### Scalability Considerations
- **Horizontal Scaling**: Multiple edge function instances
- **Database Scaling**: Connection pooling and read replicas
- **CDN Integration**: Global content distribution
- **Load Balancing**: Automatic traffic distribution

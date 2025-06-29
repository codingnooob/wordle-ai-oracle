
# Project Structure

## 📁 Directory Organization

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Feature components
├── utils/               # Utility functions
│   ├── ml/              # Machine learning utilities
│   ├── security/        # Security utilities
│   └── *.ts             # General utilities
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── integrations/        # External service integrations
└── types/               # TypeScript type definitions
```

## 🏗️ Architecture Overview

### Frontend Architecture
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Tanstack Query** for state management

### Backend Architecture
- **Supabase** for database and authentication
- **Edge Functions** for serverless API endpoints
- **PostgreSQL** for data storage
- **Row Level Security** for data protection

## 🔧 Component Organization

### UI Components (`src/components/ui/`)
- Pre-built shadcn/ui components
- Consistent design system
- Reusable across the application
- Minimal customization needed

### Feature Components (`src/components/`)
- Application-specific components
- Business logic implementation
- 50 lines or fewer when possible
- Single responsibility principle

### Page Components (`src/pages/`)
- Top-level route components
- Compose multiple feature components
- Handle page-level state and effects
- SEO and meta tag management

## 🤖 ML/AI Architecture

### ML Utilities (`src/utils/ml/`)
- **Models**: ML model initialization and management
- **Analyzers**: Word analysis and prediction logic
- **Generators**: Dynamic word generation
- **Validators**: Input validation and constraints
- **Services**: External API integrations

### Data Flow
1. User input → Validation → Constraint analysis
2. ML model processing → Word generation
3. Scoring and ranking → Result presentation
4. Caching and optimization

## 🔌 Integration Layer

### Supabase Integration (`src/integrations/supabase/`)
- Database client configuration
- Type definitions from database schema
- Edge function utilities
- Authentication helpers

### External APIs
- Word validation services
- ML model APIs
- Web scraping services
- Caching mechanisms

## 🎣 Custom Hooks (`src/hooks/`)

### Common Patterns
- Data fetching hooks
- State management hooks
- Event handling hooks
- Performance optimization hooks

### Examples
- `useMLStatus` - ML processing status
- `useWordAnalysis` - Wordle analysis logic
- `useLocalStorage` - Browser storage
- `useDebounce` - Input debouncing

## 🛠️ Utility Functions (`src/utils/`)

### Categories
- **ML/AI**: Machine learning algorithms and helpers
- **Security**: Input validation and sanitization
- **Analysis**: Wordle game logic and constraints
- **API**: External service integrations
- **Database**: Data access and manipulation

### Organization Principles
- Single responsibility per file
- Clear naming conventions
- Comprehensive error handling
- Extensive testing coverage

## 📝 Type Definitions (`src/types/`)

### Type Organization
- Database types (auto-generated)
- API request/response types
- Component prop types
- ML model types
- Utility function types

### Best Practices
- Use interfaces for object shapes
- Use type unions for limited values
- Export types from index files
- Document complex types with comments

## 🚀 Build and Deployment

### Build Process
1. TypeScript compilation
2. Vite bundling and optimization
3. Asset processing and compression
4. Environment variable injection
5. Static file generation

### Deployment Targets
- **Netlify** (primary)
- **Vercel** (alternative)
- **Static hosting** (any provider)
- **Self-hosting** (Docker available)

## 📊 Performance Considerations

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports for heavy utilities
- Separate chunks for ML models

### Optimization Strategies
- Bundle size monitoring
- Tree shaking for unused code
- Image optimization
- Caching strategies
- Service worker implementation

## 🔍 Monitoring and Analytics

### Error Tracking
- Console error logging
- User feedback collection
- Performance monitoring
- ML model accuracy tracking

### Development Tools
- React Developer Tools
- TypeScript language server
- ESLint and Prettier integration
- Hot module replacement

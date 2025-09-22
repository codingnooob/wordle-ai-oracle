# Custom Domain API Setup

This project now supports custom domain API endpoints that match your production website URL instead of using the default Supabase Edge Function URLs.

## How It Works

### Development Environment
- Uses direct Supabase Edge Function URLs for development
- Base URL: `https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api`

### Production Environment  
- Uses custom domain API routes through Vercel
- Base URL: `https://yourdomain.com/api/wordle-solver`

## API Endpoints

### Main Analysis Endpoint
- **Development**: `https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api`  
- **Production**: `https://yourdomain.com/api/wordle-solver`

### Status Check Endpoint
- **Development**: `https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api/status/{jobId}/{sessionToken}`
- **Production**: `https://yourdomain.com/api/wordle-solver/status/{jobId}/{sessionToken}`

## Implementation Details

### Vercel API Routes
- `/api/wordle-solver/index.ts` - Main API proxy endpoint
- `/api/wordle-solver/status/[...params].ts` - Status checking endpoint

### Frontend Configuration
- `src/utils/apiConfig.ts` - Environment-aware API URL management
- Automatic detection of development vs production environment
- Seamless fallback between direct Supabase and custom domain routing

### Security Features
- Maintains all existing security headers and CORS configuration
- Forwards client IP addresses for rate limiting
- Preserves API key authentication
- Implements proper request validation

## Benefits

1. **Professional Branding**: API URLs match your domain name
2. **Seamless Development**: Works in both development and production environments  
3. **Maintained Security**: All existing security features preserved
4. **Better Documentation**: API examples show your branded URLs
5. **No Breaking Changes**: Existing functionality remains unchanged

## Configuration

The system automatically detects the environment and configures the appropriate API URLs:

```typescript
// Environment detection in src/utils/apiConfig.ts
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('lovable.app');
```

## Deployment

1. Deploy your application to your custom domain
2. The API routes will automatically be available at `/api/wordle-solver`
3. Documentation will automatically show your custom domain URLs
4. No additional configuration required

## Testing

The API tester in the documentation will automatically use the correct endpoints based on your environment, making it easy to test both development and production setups.
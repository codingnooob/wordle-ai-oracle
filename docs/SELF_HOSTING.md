
# Self-Hosting Guide

## 🏢 Deployment Options

### Option 1: Vercel Deployment (Recommended)

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

## 🔧 Supabase Setup

### 1. Create a New Supabase Project
- Visit [supabase.com](https://supabase.com)
- Create a new project
- Note your project URL and API keys

### 2. Database Schema Setup
Set up the database schema if using custom tables:

```sql
-- Example schema for analytics (optional)
CREATE TABLE IF NOT EXISTS word_analytics (
  id SERIAL PRIMARY KEY,
  word VARCHAR(20) NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_used TIMESTAMP DEFAULT NOW()
);
```

### 3. Deploy Edge Functions
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy wordle-solver-api
```

### 4. Configure Secrets
```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set RATE_LIMIT_WINDOW=900000
supabase secrets set RATE_LIMIT_MAX_REQUESTS=100
```

## 🐳 Docker Deployment (Advanced)

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  wordle-ai:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### Build and Run
```bash
# Build the image
docker build -t wordle-ai-oracle .

# Run the container
docker run -p 3000:80 --env-file .env wordle-ai-oracle

# Or use docker-compose
docker-compose up -d
```

## ⚙️ Environment Configuration

### Production Environment Variables
```env
# Required
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
NODE_ENV=production

# Optional
OPENAI_API_KEY=your_openai_api_key
VITE_RATE_LIMIT_REQUESTS=100
VITE_RATE_LIMIT_WINDOW_MS=900000

# Disable development features
VITE_DEV_MODE=false
VITE_DEBUG_LOGGING=false
```

### Security Configuration
```env
# Security headers
VITE_CSP_ENABLED=true
VITE_HTTPS_ONLY=true
VITE_CORS_ORIGINS=https://yourdomain.com

# Rate limiting
VITE_RATE_LIMIT_ENABLED=true
VITE_RATE_LIMIT_REQUESTS=100
VITE_RATE_LIMIT_WINDOW_MS=900000
```

## 🌐 Domain and SSL Setup

### Custom Domain
1. **Configure DNS** to point to your hosting provider
2. **Set up SSL certificate** (Let's Encrypt recommended)
3. **Configure HTTPS redirects**
4. **Update CORS settings** in Supabase

### SSL Certificate (Let's Encrypt)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Configure auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Maintenance

### Health Checks
Create a health check endpoint:

```javascript
// In your edge function
export async function healthCheck() {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Monitoring Setup
- **Uptime monitoring**: Use Uptime Robot or similar
- **Error tracking**: Configure Sentry or LogRocket
- **Performance monitoring**: Set up analytics
- **Log aggregation**: Use centralized logging

### Backup Strategy
- **Database backups**: Supabase handles this automatically
- **Environment configuration**: Store securely
- **Application code**: Version control with Git
- **Media assets**: Cloud storage backup

## 🔧 Performance Optimization

### CDN Configuration
- Use Cloudflare or similar CDN
- Enable compression and caching
- Optimize image delivery
- Configure cache headers

### Database Optimization
- Monitor query performance
- Set up proper indexes
- Configure connection pooling
- Regular maintenance tasks

### Application Optimization
- Enable gzip compression
- Minify assets
- Use service workers for caching
- Implement lazy loading

## 🚨 Troubleshooting

### Common Issues
- **Build failures**: Check dependencies and environment variables
- **Runtime errors**: Verify API endpoints and database connectivity
- **Performance issues**: Analyze bundle size and network requests
- **ML model errors**: Check model availability and error handling

### Debug Tools
- Browser developer tools
- Server logs and monitoring
- Supabase dashboard
- Performance profiling tools

### Support Resources
- [GitHub Issues](https://github.com/codingnooob/wordle-ai-oracle/issues)
- [Documentation](https://github.com/codingnooob/wordle-ai-oracle/docs)
- [Community Discussions](https://github.com/codingnooob/wordle-ai-oracle/discussions)

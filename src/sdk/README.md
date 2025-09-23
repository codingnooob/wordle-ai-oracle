# Wordle AI Oracle SDK

Client libraries for the Wordle AI Oracle API with smart fallback logic and automatic error handling.

## Features

- **Smart Fallback Logic**: Automatically tries custom domain first, falls back to direct Supabase URL
- **Cross-Platform**: Works in browsers, Node.js, Python environments
- **Async Support**: Handles both immediate and asynchronous analysis jobs
- **Error Handling**: Built-in retry logic and descriptive error messages
- **TypeScript Support**: Full type definitions for JavaScript/TypeScript projects

## Quick Start

### JavaScript/Node.js

```javascript
const WordleAIClient = require('./wordleai-client');

const client = new WordleAIClient({
  apiKey: 'your-api-key' // optional
});

// Analyze guess
const result = await client.analyze([
  { letter: 'C', state: 'absent' },
  { letter: 'R', state: 'present' },
  { letter: 'A', state: 'present' },
  { letter: 'N', state: 'absent' },
  { letter: 'E', state: 'correct' }
]);

console.log('Solutions:', result.solutions);
```

### Python

```python
from wordleai_client import WordleAIClient

client = WordleAIClient(api_key="your-api-key")  # optional

# Analyze guess
result = client.analyze([
    {"letter": "C", "state": "absent"},
    {"letter": "R", "state": "present"},
    {"letter": "A", "state": "present"},
    {"letter": "N", "state": "absent"},
    {"letter": "E", "state": "correct"}
])

print("Solutions:", result["solutions"])
```

## API Reference

### JavaScript SDK

#### Constructor Options

- `customDomainUrl` (string): Custom domain URL (default: https://wordlesolver.ai/api)
- `fallbackUrl` (string): Fallback Supabase URL
- `apiKey` (string): Optional API key for authentication
- `timeout` (number): Request timeout in milliseconds (default: 10000)

#### Methods

- `analyze(guessData, options)`: Analyze Wordle guess data
- `getStatus(jobId, sessionToken)`: Check job status
- `pollJobStatus(jobId, sessionToken, maxAttempts)`: Poll until job completion

### Python SDK

#### Constructor Parameters

- `custom_domain_url` (str): Custom domain URL
- `fallback_url` (str): Fallback Supabase URL
- `api_key` (str, optional): API key for authentication
- `timeout` (int): Request timeout in seconds (default: 10)

#### Methods

- `analyze(guess_data, **kwargs)`: Analyze Wordle guess data
- `get_status(job_id, session_token)`: Check job status
- `poll_job_status(job_id, session_token, max_attempts)`: Poll until completion

## Advanced Usage

### Custom Configuration

```javascript
// JavaScript
const client = new WordleAIClient({
  customDomainUrl: 'https://your-custom-domain.com/api',
  fallbackUrl: 'https://your-fallback.supabase.co/functions/v1/wordle-solver-api',
  apiKey: 'your-secret-key',
  timeout: 15000
});
```

```python
# Python
client = WordleAIClient(
    custom_domain_url="https://your-custom-domain.com/api",
    fallback_url="https://your-fallback.supabase.co/functions/v1/wordle-solver-api",
    api_key="your-secret-key",
    timeout=15
)
```

### Async Processing

```javascript
// JavaScript - Handle async processing manually
const result = await client.analyze(guessData, {
  responseMode: 'async',
  pollForResult: false  // Don't auto-poll
});

if (result.job_id) {
  // Poll manually later
  const finalResult = await client.pollJobStatus(result.job_id, result.session_token);
}
```

```python
# Python - Handle async processing manually
result = client.analyze(
    guess_data,
    response_mode='async',
    poll_for_result=False  # Don't auto-poll
)

if result.get('job_id'):
    # Poll manually later
    final_result = client.poll_job_status(result['job_id'], result['session_token'])
```

### Error Handling

```javascript
// JavaScript
try {
  const result = await client.analyze(guessData);
  console.log('Analysis completed:', result);
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

```python
# Python
try:
    result = client.analyze(guess_data)
    print("Analysis completed:", result)
except Exception as error:
    print("Analysis failed:", str(error))
```

## Letter States

The API accepts three letter states:

- `correct`: Letter is in the correct position (green in Wordle)
- `present`: Letter is in the word but wrong position (yellow in Wordle)
- `absent`: Letter is not in the word (gray in Wordle)

## Response Format

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "complete",
  "solutions": [
    { "word": "AROSE", "probability": 85.2 },
    { "word": "ARGUE", "probability": 78.9 }
  ],
  "confidence_score": 0.95,
  "processing_status": "complete"
}
```

## Support

For issues and questions:
- Check the [API Documentation](https://wordlesolver.ai/api-docs)
- Review the troubleshooting section
- Contact support with specific error messages and request details

## License

MIT License - see LICENSE file for details.
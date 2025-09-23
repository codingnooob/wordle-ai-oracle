
# API Guide

## 🔌 REST API Endpoints

The Wordle AI Oracle provides a powerful REST API for integrating Wordle solving capabilities into your applications.

### Base URL

**API Endpoint**: `https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api`

This endpoint works reliably across all environments - web applications, server-to-server integrations, terminal usage, and cURL commands.

### POST /wordle-solver
Analyze Wordle guesses and get AI-powered word predictions.

**⚠️ Validation Requirements:**
- All letters must have a known state: `correct`, `present`, or `absent`
- No `unknown` states are allowed - complete your analysis before API submission
- The `guessData` length must exactly match `wordLength`
- Requests with incomplete analysis will return 400 error responses

**Request Body:**
```json
{
  "guessData": [
    { "letter": "C", "state": "absent" },
    { "letter": "R", "state": "present" },
    { "letter": "A", "state": "present" },
    { "letter": "N", "state": "absent" },
    { "letter": "E", "state": "correct" }
  ],
  "wordLength": 5,
  "excludedLetters": ["T", "I", "S"],
  "apiKey": "optional-api-key"
}
```

**Success Response:** *(Example response - actual results may vary based on ML analysis)*
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

**Error Response (Validation Failure):**
```json
{
  "error": "Tile at position 4 has invalid state 'unknown'. Only 'correct', 'present', and 'absent' are allowed. All tiles must have a known state"
}
```

### GET /wordle-solver/status/{job_id}
Check the status of async analysis jobs.


## 💻 Direct API Examples

### JavaScript/Node.js (Direct API)
```javascript
// Use direct Supabase URL for reliable server usage
const response = await fetch('https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key' // optional
  },
  body: JSON.stringify({
    guessData: [
      { letter: 'C', state: 'absent' },
      { letter: 'R', state: 'present' },
      { letter: 'A', state: 'present' },
      { letter: 'N', state: 'absent' },
      { letter: 'E', state: 'correct' }
    ],
    wordLength: 5,
    excludedLetters: ['T', 'I', 'S']
  })
});

const result = await response.json();
if (response.ok) {
  console.log('Solutions:', result.solutions);
  // Expected (actual results may vary): [{ word: "AROSE", probability: 85.2 }, { word: "ARGUE", probability: 78.9 }]
} else {
  console.error('API Error:', result.error);
}
```

### Python (Direct API)
```python
import requests

# Use direct Supabase URL for reliable server usage
response = requests.post('https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api', json={
    'guessData': [
        {'letter': 'C', 'state': 'absent'},
        {'letter': 'R', 'state': 'present'},
        {'letter': 'A', 'state': 'present'},
        {'letter': 'N', 'state': 'absent'},
        {'letter': 'E', 'state': 'correct'}
    ],
    'wordLength': 5,
    'excludedLetters': ['T', 'I', 'S']
})

if response.status_code == 200:
    result = response.json()
    print('Solutions:', result['solutions'])
    # Expected (actual results may vary): [{'word': 'AROSE', 'probability': 85.2}, {'word': 'ARGUE', 'probability': 78.9}]
else:
    error_result = response.json()
    print('API Error:', error_result['error'])
```

### cURL (Direct API)
```bash
# Use direct Supabase URL for reliable terminal usage
curl -X POST 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api' \
  -H 'Content-Type: application/json' \
  -d '{
    "guessData": [
      {"letter": "C", "state": "absent"},
      {"letter": "R", "state": "present"},
      {"letter": "A", "state": "present"},
      {"letter": "N", "state": "absent"},
      {"letter": "E", "state": "correct"}
    ],
    "wordLength": 5,
    "excludedLetters": ["T", "I", "S"]
  }'
```

## 🔧 API Features
- **Rate Limiting**: 100 requests per hour per API key/IP
- **Async Processing**: Long-running analyses return job IDs for status checking
- **Multiple Response Modes**: Immediate results (< 10s) or async processing
- **Letter States**: Support for correct, present, and absent letter states only
- **Word Length Support**: Configurable word lengths from 3-15 letters
- **Strict Validation**: Complete guess analysis required before submission

## 📚 Full Documentation
For complete API documentation with interactive examples, visit: [https://wordlesolver.ai/api-docs](https://wordlesolver.ai/api-docs)

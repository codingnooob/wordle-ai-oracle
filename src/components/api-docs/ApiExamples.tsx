
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiExamplesProps {
  baseUrl: string;
}

const ApiExamples = ({ baseUrl }: ApiExamplesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Examples</CardTitle>
        <CardDescription>Code examples for different programming languages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">JavaScript/Node.js</h3>
          <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`// Analyze a Wordle guess
const response = await fetch('${baseUrl}/wordle-solver', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key' // optional
  },
  body: JSON.stringify({
    guessData: [
      { letter: 'H', state: 'correct' },
      { letter: 'O', state: 'present' },
      { letter: 'U', state: 'absent' },
      { letter: 'S', state: 'correct' },
      { letter: 'E', state: 'unknown' }
    ],
    wordLength: 5,
    excludedLetters: ['B', 'C', 'D']
  })
});

const result = await response.json();

if (result.status === 'complete') {
  console.log('Solutions:', result.solutions);
} else if (result.status === 'processing') {
  // Check status later
  const statusResponse = await fetch(\`${baseUrl}/wordle-solver/status/\${result.job_id}\`);
  const statusResult = await statusResponse.json();
  console.log('Status:', statusResult.status);
}`}
          </pre>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Python</h3>
          <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`import requests
import time

# Analyze a Wordle guess
url = '${baseUrl}/wordle-solver'
data = {
    'guessData': [
        {'letter': 'H', 'state': 'correct'},
        {'letter': 'O', 'state': 'present'},
        {'letter': 'U', 'state': 'absent'},
        {'letter': 'S', 'state': 'correct'},
        {'letter': 'E', 'state': 'unknown'}
    ],
    'wordLength': 5,
    'excludedLetters': ['B', 'C', 'D']
}

response = requests.post(url, json=data)
result = response.json()

if result['status'] == 'complete':
    print('Solutions:', result['solutions'])
elif result['status'] == 'processing':
    # Poll for completion
    job_id = result['job_id']
    while True:
        status_response = requests.get(f'{baseUrl}/wordle-solver/status/{job_id}')
        status_result = status_response.json()
        
        if status_result['status'] in ['complete', 'failed', 'partial']:
            print('Final result:', status_result['solutions'])
            break
        
        time.sleep(2)  # Wait 2 seconds before checking again`}
          </pre>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">cURL</h3>
          <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`# Analyze a Wordle guess
curl -X POST '${baseUrl}/wordle-solver' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: your-api-key' \\
  -d '{
    "guessData": [
      {"letter": "H", "state": "correct"},
      {"letter": "O", "state": "present"},
      {"letter": "U", "state": "absent"},
      {"letter": "S", "state": "correct"},
      {"letter": "E", "state": "unknown"}
    ],
    "wordLength": 5,
    "excludedLetters": ["B", "C", "D"]
  }'

# Check status of async job
curl '${baseUrl}/wordle-solver/status/123e4567-e89b-12d3-a456-426614174000'`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiExamples;

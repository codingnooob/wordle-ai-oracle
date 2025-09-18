
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
          <ScrollArea className="w-full rounded border h-96">
            <pre className="bg-slate-100 p-4 text-sm whitespace-pre min-w-max">
{`// Analyze a completed Wordle guess
const response = await fetch('${baseUrl}/wordle-solver', {
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
  if (result.status === 'complete') {
    console.log('Solutions:', result.solutions);
    // Example output (actual results may vary):
    // [
    //   { word: "AROSE", probability: 85.2 },
    //   { word: "ARGUE", probability: 78.9 }
    // ]
  } else if (result.status === 'processing') {
    // Store the session token for status checking
    const jobId = result.job_id;
    const sessionToken = result.session_token;
    
    // Check status later using both job_id and session_token
    const statusResponse = await fetch(\`${baseUrl}/wordle-solver/status/\${jobId}/\${sessionToken}\`);
    const statusResult = await statusResponse.json();
    console.log('Status:', statusResult.status);
  }
} else {
  console.error('API Error:', result.error);
}`}
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Python</h3>
          <ScrollArea className="w-full rounded border h-96">
            <pre className="bg-slate-100 p-4 text-sm whitespace-pre min-w-max">
{`import requests
import time

# Analyze a completed Wordle guess
url = '${baseUrl}/wordle-solver'
data = {
    'guessData': [
        {'letter': 'C', 'state': 'absent'},
        {'letter': 'R', 'state': 'present'},
        {'letter': 'A', 'state': 'present'},
        {'letter': 'N', 'state': 'absent'},
        {'letter': 'E', 'state': 'correct'}
    ],
    'wordLength': 5,
    'excludedLetters': ['T', 'I', 'S']
}

response = requests.post(url, json=data)

if response.status_code == 200:
    result = response.json()
    
    if result['status'] == 'complete':
        print('Solutions:', result['solutions'])
        # Example output (actual results may vary):
        # [
        #   {'word': 'AROSE', 'probability': 85.2},
        #   {'word': 'ARGUE', 'probability': 78.9}
        # ]
    elif result['status'] == 'processing':
        # Store session token for status checking
        job_id = result['job_id']
        session_token = result['session_token']
        
        # Poll for completion using both job_id and session_token
        while True:
            status_response = requests.get(f'{baseUrl}/wordle-solver/status/{job_id}/{session_token}')
            status_result = status_response.json()
            
            if status_result['status'] in ['complete', 'failed', 'partial']:
                print('Final result:', status_result['solutions'])
                break
            
            time.sleep(2)  # Wait 2 seconds before checking again
else:
    error_result = response.json()
    print('API Error:', error_result['error'])`}
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">cURL</h3>
          <ScrollArea className="w-full rounded border h-80">
            <pre className="bg-slate-100 p-4 text-sm whitespace-pre min-w-max">
{`# Analyze a completed Wordle guess
curl -X POST '${baseUrl}/wordle-solver' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: your-api-key' \\
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

# Example successful response (actual results may vary):
# {
#   "job_id": "123e4567-e89b-12d3-a456-426614174000",
#   "session_token": "abcd1234-5678-90ef-ghij-klmnopqrstuv",
#   "status": "complete",
#   "solutions": [
#     {"word": "AROSE", "probability": 85.2},
#     {"word": "ARGUE", "probability": 78.9}
#   ]
# }

# Check status of async job using both job_id and session_token
curl '${baseUrl}/wordle-solver/status/123e4567-e89b-12d3-a456-426614174000/abcd1234-5678-90ef-ghij-klmnopqrstuv'

# Example error response for validation failure
curl -X POST '${baseUrl}/wordle-solver' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "guessData": [
      {"letter": "C", "state": "unknown"}
    ],
    "wordLength": 5
  }'
# Returns: {"error": "Tile at position 0 has invalid state 'unknown'. Only 'correct', 'present', and 'absent' are allowed. All tiles must have a known state"}`}
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiExamples;

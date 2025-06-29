
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ApiDocumentation = () => {
  // Dynamic base URL that uses the current domain
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://wordlesolver.ai/api';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Wordly AI Oracle API</h1>
        <p className="text-slate-600">REST API for Wordle puzzle solving with ML-powered predictions</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                The Wordly AI Oracle API provides ML-powered Wordle puzzle solving capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                <code className="bg-slate-100 px-2 py-1 rounded text-sm">{baseUrl}</code>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                <p className="text-slate-600 mb-2">Optional API key can be provided in headers:</p>
                <code className="bg-slate-100 px-2 py-1 rounded text-sm">X-API-Key: your-api-key</code>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Rate Limits</h3>
                <p className="text-slate-600">100 requests per hour per API key/IP address</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Response Modes</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Immediate</Badge>
                    <span className="text-sm">Results returned immediately (within 10 seconds)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Async</Badge>
                    <span className="text-sm">Job ID returned for longer processing, check status separately</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>POST /wordle-solver</CardTitle>
              <CardDescription>Analyze a Wordle guess and get word predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Request Body</h3>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`{
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
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Letter States</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><Badge className="bg-green-500">correct</Badge> - Letter in correct position</div>
                  <div><Badge className="bg-yellow-500">present</Badge> - Letter in word, wrong position</div>
                  <div><Badge className="bg-slate-500">absent</Badge> - Letter not in word</div>
                  <div><Badge variant="outline">unknown</Badge> - Letter not yet analyzed</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Response (Immediate)</h3>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "complete",
  "solutions": [
    { "word": "HOUSE", "probability": 85.2 },
    { "word": "HORSE", "probability": 78.9 },
    { "word": "HASTE", "probability": 65.4 }
  ],
  "confidence_score": 0.95,
  "processing_status": "complete",
  "message": "Analysis completed immediately"
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Response (Async)</h3>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing",
  "message": "Analysis started, check status using the job_id",
  "estimated_completion_seconds": 15,
  "status_url": "${baseUrl}/wordle-solver/status/123e..."
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>GET /wordle-solver/status/{`{job_id}`}</CardTitle>
              <CardDescription>Check the status of an async analysis job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">URL Parameters</h3>
                <div className="bg-slate-100 p-2 rounded text-sm">
                  <strong>job_id</strong> - UUID of the analysis job returned from the analyze endpoint
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Response</h3>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
{`{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "complete",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:30:15Z",
  "estimated_completion_seconds": 15,
  "solutions": [
    { "word": "HOUSE", "probability": 85.2 },
    { "word": "HORSE", "probability": 78.9 }
  ],
  "confidence_score": 0.95,
  "processing_status": "complete"
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Status Values</h3>
                <div className="space-y-1 text-sm">
                  <div><Badge variant="outline">processing</Badge> - Analysis in progress</div>
                  <div><Badge className="bg-green-500">complete</Badge> - Analysis finished successfully</div>
                  <div><Badge className="bg-yellow-500">partial</Badge> - Analysis finished with limited results</div>
                  <div><Badge variant="destructive">failed</Badge> - Analysis failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;

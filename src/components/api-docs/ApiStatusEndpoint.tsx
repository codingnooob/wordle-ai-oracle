
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ApiStatusEndpoint = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GET /wordle-solver/status/{`{job_id}/{session_token}`}</CardTitle>
        <CardDescription>Check the status of an async analysis job</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">URL Parameters</h3>
          <div className="bg-slate-100 p-2 rounded text-sm space-y-1">
            <div><strong>job_id</strong> - UUID of the analysis job returned from the analyze endpoint</div>
            <div><strong>session_token</strong> - Session token returned from the analyze endpoint for authentication</div>
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

        <div>
          <h3 className="text-lg font-semibold mb-2">Complete Workflow Example</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Step 1: Initial Analysis Request</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
{`POST /wordle-solver
{
  "guessData": [{"letter": "C", "state": "absent"}],
  "wordLength": 5,
  "responseMode": "async"
}

Response:
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "session_token": "abc123xyz789",
  "status": "processing",
  "estimated_completion_seconds": 15
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Step 2: Check Status Using Job ID & Session Token</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
{`GET /wordle-solver/status/123e4567-e89b-12d3-a456-426614174000/abc123xyz789

Response (when complete):
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "complete",
  "solutions": [
    { "word": "HOUSE", "probability": 85.2 },
    { "word": "HORSE", "probability": 78.9 }
  ],
  "confidence_score": 0.95
}`}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Code Examples</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">JavaScript/Fetch</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
{`// Initial request
const response = await fetch('/wordle-solver', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guessData: [{"letter": "C", "state": "absent"}],
    wordLength: 5,
    responseMode: "async"
  })
});

const result = await response.json();
const { job_id, session_token } = result;

// Poll for results
const checkStatus = async () => {
  // URL encode the session token to handle special characters
  const encodedToken = encodeURIComponent(session_token);
  const statusResponse = await fetch(
    \`/wordle-solver/status/\${job_id}/\${encodedToken}\`
  );
  const status = await statusResponse.json();
  
  if (status.status === 'complete') {
    console.log('Results:', status.solutions);
  } else if (status.status === 'processing') {
    setTimeout(checkStatus, 3000); // Check again in 3 seconds
  }
};

checkStatus();`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">cURL</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
{`# Initial request
curl -X POST /wordle-solver \\
  -H "Content-Type: application/json" \\
  -d '{"guessData":[{"letter":"C","state":"absent"}],"wordLength":5,"responseMode":"async"}'

# Check status (use job_id and session_token from above response)
curl -X GET /wordle-solver/status/123e4567-e89b-12d3-a456-426614174000/abc123xyz789`}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
          <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
            <p className="font-medium text-red-800 mb-2">Common Issues:</p>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              <li><strong>404 "Job not found":</strong> Check that the session token is properly URL encoded and matches exactly</li>
              <li><strong>401 "Session token required":</strong> Ensure the URL format is correct: /status/job_id/session_token</li>
              <li><strong>Expired job:</strong> Jobs older than 1 hour are automatically cleaned up</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ URL Encoding Required</h4>
            <p className="text-sm text-yellow-700">
              Session tokens may contain special characters that need to be URL encoded when used in the URL path. 
              Always use <code>encodeURIComponent()</code> in JavaScript or equivalent encoding in other languages.
            </p>
            <div className="mt-2 text-xs text-yellow-600">
              <strong>Example:</strong> If session token is "abc/123+def", encode it as "abc%2F123%2Bdef"
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatusEndpoint;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ApiAnalyzeEndpointProps {
  baseUrl: string;
}

const ApiAnalyzeEndpoint = ({ baseUrl }: ApiAnalyzeEndpointProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>POST /wordle-solver</CardTitle>
        <CardDescription>Analyze a Wordle guess and get word predictions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Validation Requirements</h3>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm space-y-1">
            <p><strong>⚠️ Important:</strong> All request validation rules must be met:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All letters must have a known state: <code>correct</code>, <code>present</code>, or <code>absent</code></li>
              <li>The <code>guessData</code> length must exactly match <code>wordLength</code></li>
              <li>Each letter must be a single alphabetic character</li>
              <li>No <code>unknown</code> states are allowed</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Request Parameters</h3>
          <div className="text-sm space-y-2 mb-4">
            <div><code>guessData</code> (required) - Array of letter objects with state information</div>
            <div><code>wordLength</code> (required) - Target word length (3-15 letters)</div>
            <div><code>excludedLetters</code> (optional) - Array of letters to exclude from results</div>
            <div><code>maxResults</code> (optional) - Number of results to return. Default: 15, Use 0 for unlimited (up to 1000)</div>
            <div><code>responseMode</code> (optional) - Processing mode: immediate/async/auto</div>
            <div><code>apiKey</code> (optional) - Your API key for higher rate limits</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Request Body Example</h3>
          <ScrollArea className="w-full rounded border h-64">
            <pre className="bg-slate-100 p-4 text-sm whitespace-pre min-w-max">
{`{
  "guessData": [
    { "letter": "C", "state": "absent" },
    { "letter": "R", "state": "present" },
    { "letter": "A", "state": "present" },
    { "letter": "N", "state": "absent" },
    { "letter": "E", "state": "correct" }
  ],
  "wordLength": 5,
  "excludedLetters": ["T", "I", "S"],
  "positionExclusions": {
    "R": [1], 
    "A": [2]
  },
  "maxResults": 25,
  "responseMode": "immediate",
  "apiKey": "your-api-key-here"
}`}
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Response Mode (optional)</h3>
          <div className="text-sm space-y-1">
            <div><Badge variant="outline">immediate</Badge> - Force synchronous processing, return error if timeout</div>
            <div><Badge variant="outline">async</Badge> - Always return job ID and process in background</div>
            <div><Badge variant="outline">auto</Badge> - Try immediate, fallback to async (default)</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Letter States</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div><Badge className="bg-green-500">correct</Badge> - Letter in correct position (green tile)</div>
            <div><Badge className="bg-yellow-500">present</Badge> - Letter in word, wrong position (yellow tile)</div>
            <div><Badge className="bg-slate-500">absent</Badge> - Letter not in word (gray tile)</div>
          </div>
          <p className="text-xs text-red-600 mt-2">⚠️ <code>unknown</code> states are not allowed - all tiles must be analyzed before API submission</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Success Response (Immediate)</h3>
          <p className="text-sm text-slate-600 mb-2">*(Example response - actual results may vary based on ML analysis)*</p>
          <ScrollArea className="w-full rounded border h-48">
            <pre className="bg-slate-100 p-4 text-sm whitespace-pre min-w-max">
{`{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "session_token": "abc123def456...",
  "solutions": [
    { "word": "AROSE", "probability": 85.2 },
    { "word": "ARGUE", "probability": 78.9 },
    { "word": "LARGE", "probability": 65.4 }
  ],
  "status": "complete",
  "confidence_score": 0.95,
  "processing_status": "complete",
  "response_mode": "immediate",
  "message": "Analysis completed immediately"
}`}
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Success Response (Async)</h3>
          <p className="text-sm text-slate-600 mb-2">*(Example response - actual results may vary)*</p>
          <ScrollArea className="w-full rounded border h-48">
            <pre className="bg-slate-100 p-4 text-sm whitespace-pre min-w-max">
{`{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "session_token": "abc123def456ghi789jkl012mno345pqr678",
  "status": "processing",
  "message": "Analysis started, check status using the job_id and session_token",
  "estimated_completion_seconds": 15,
  "response_mode": "async",
  "status_url": "${baseUrl}/status/123e..."
}`}
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Error Responses</h3>
          <div className="space-y-2">
            <div>
              <Badge variant="destructive">400 Bad Request</Badge>
              <ScrollArea className="w-full rounded border mt-1 h-20">
                <pre className="bg-red-50 p-2 text-xs whitespace-pre min-w-max">
{`{
  "error": "Tile at position 4 has invalid state 'unknown'. Only 'correct', 'present', and 'absent' are allowed. All tiles must have a known state"
}`}
                </pre>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div>
              <Badge variant="destructive">400 Bad Request</Badge>
              <ScrollArea className="w-full rounded border mt-1 h-16">
                <pre className="bg-red-50 p-2 text-xs whitespace-pre min-w-max">
{`{
  "error": "guessData length (4) must match wordLength (5)"
}`}
                </pre>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div>
              <Badge variant="destructive">429 Too Many Requests</Badge>
              <ScrollArea className="w-full rounded border mt-1 h-16">
                <pre className="bg-red-50 p-2 text-xs whitespace-pre min-w-max">
{`{
  "error": "Rate limit exceeded"
}`}
                </pre>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiAnalyzeEndpoint;

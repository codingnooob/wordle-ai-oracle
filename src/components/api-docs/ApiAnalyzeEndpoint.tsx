
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  );
};

export default ApiAnalyzeEndpoint;

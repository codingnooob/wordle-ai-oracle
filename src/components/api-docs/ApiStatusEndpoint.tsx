
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ApiStatusEndpoint = () => {
  return (
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
  );
};

export default ApiStatusEndpoint;

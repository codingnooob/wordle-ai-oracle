
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ApiOverviewProps {
  baseUrl: string;
}

const ApiOverview = ({ baseUrl }: ApiOverviewProps) => {
  return (
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
  );
};

export default ApiOverview;

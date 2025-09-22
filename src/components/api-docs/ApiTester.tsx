import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiConfig } from '@/utils/apiConfig';

interface ApiTesterProps {
  baseUrl: string;
}

interface GuessTile {
  letter: string;
  state: 'correct' | 'present' | 'absent';
}

const ApiTester = ({ baseUrl }: ApiTesterProps) => {
  const { toast } = useToast();
  const [wordLength, setWordLength] = useState(5);
  const [guessData, setGuessData] = useState<GuessTile[]>([
    { letter: '', state: 'absent' },
    { letter: '', state: 'absent' },
    { letter: '', state: 'absent' },
    { letter: '', state: 'absent' },
    { letter: '', state: 'absent' }
  ]);
  const [excludedLetters, setExcludedLetters] = useState('');
  const [positionExclusions, setPositionExclusions] = useState<Record<string, number[]>>({});
  const [apiKey, setApiKey] = useState('');
  const [responseMode, setResponseMode] = useState<'immediate' | 'async' | 'auto'>('immediate');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [pollingToken, setPollingToken] = useState<string | null>(null);
  const [pollingAttempt, setPollingAttempt] = useState(0);
  const [pollingMaxAttempts] = useState(30);
  const [showStatusDemo, setShowStatusDemo] = useState(false);
  const [demoJobId, setDemoJobId] = useState('');
  const [demoSessionToken, setDemoSessionToken] = useState('');

  const updateWordLength = (newLength: number) => {
    setWordLength(newLength);
    const newGuessData = Array(newLength).fill(null).map((_, i) => 
      guessData[i] || { letter: '', state: 'absent' as const }
    );
    setGuessData(newGuessData);
    setPositionExclusions({});
  };

  const updateGuessTile = (index: number, field: 'letter' | 'state', value: string) => {
    const newGuessData = [...guessData];
    if (field === 'letter') {
      newGuessData[index] = { ...newGuessData[index], letter: value.toUpperCase() };
    } else {
      newGuessData[index] = { ...newGuessData[index], state: value as 'correct' | 'present' | 'absent' };
    }
    setGuessData(newGuessData);
  };

  const testApi = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const apiConfig = getApiConfig();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey.trim()) {
        headers['X-API-Key'] = apiKey.trim();
      }

      const requestBody = {
        guessData: guessData.filter(tile => tile.letter.trim() !== ''),
        wordLength,
        excludedLetters: excludedLetters.split(',').map(l => l.trim().toUpperCase()).filter(l => l),
        responseMode,
        ...(Object.keys(positionExclusions).length > 0 && { positionExclusions })
      };

      const res = await fetch(apiConfig.analyze, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      // Check if response is empty or not JSON
      const responseText = await res.text();
      let result;
      
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      setResponse({ status: res.status, data: result });

      if (res.ok) {
        if (result.status === 'processing' && result.job_id && result.session_token) {
          // Start polling for async results
          setPollingJobId(result.job_id);
          setPollingToken(result.session_token);
          setPollingAttempt(0);
          pollJobStatus(result.job_id, result.session_token);
          toast({
            title: `Analysis Started (${responseMode} mode)`, 
            description: "Processing in background. Polling for results...",
          });
        } else if (result.solutions) {
          // Immediate response
          toast({
            title: `Analysis Complete (${responseMode} mode)`,
            description: `Received ${result.solutions?.length || 0} solutions immediately`,
          });
        } else {
          toast({
            title: "API Test Successful",
            description: `Response received in ${responseMode} mode`,
          });
        }
      } else {
        toast({
          title: "API Test Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('API test error:', error);
      const errorResult = { error: error instanceof Error ? error.message : 'Network error' };
      setResponse({ status: 'error', data: errorResult });
      toast({
        title: "Network Error",
        description: "Failed to connect to API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string, sessionToken: string, attempt = 0) => {
    setPollingAttempt(attempt);
    
    if (attempt > pollingMaxAttempts) {
      toast({
        title: "Polling Timeout",
        description: "Analysis is taking longer than expected",
        variant: "destructive"
      });
      setPollingJobId(null);
      setPollingToken(null);
      setPollingAttempt(0);
      setLoading(false);
      return;
    }

    try {
      const apiConfig = getApiConfig();
      const statusRes = await fetch(apiConfig.status(jobId, sessionToken));
      const statusData = await statusRes.json();
      
      if (statusData.status === 'complete' || statusData.status === 'failed' || statusData.status === 'partial') {
        setResponse({ status: statusRes.status, data: statusData });
        setPollingJobId(null);
        setPollingToken(null);
        setPollingAttempt(0);
        setLoading(false);
        
        if (statusData.status === 'complete') {
          toast({
            title: "Analysis Complete",
            description: `Received ${statusData.solutions?.length || 0} solutions after ${attempt + 1} attempts`,
          });
        } else if (statusData.status === 'partial') {
          toast({
            title: "Analysis Partial",
            description: "Processing completed with limited results",
            variant: "default"
          });
        } else {
          toast({
            title: "Analysis Failed",
            description: "Processing completed with errors",
            variant: "destructive"
          });
        }
      } else {
        // Continue polling
        setTimeout(() => pollJobStatus(jobId, sessionToken, attempt + 1), 3000);
      }
    } catch (error) {
      console.error('Polling error:', error);
      setTimeout(() => pollJobStatus(jobId, sessionToken, attempt + 1), 3000);
    }
  };

  const stopPolling = () => {
    setPollingJobId(null);
    setPollingToken(null);
    setPollingAttempt(0);
    setLoading(false);
    toast({
      title: "Polling Stopped",
      description: "Stopped checking for results",
    });
  };

  const testStatusCheck = async () => {
    if (!demoJobId.trim() || !demoSessionToken.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both job ID and session token",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const apiConfig = getApiConfig();
      const statusRes = await fetch(apiConfig.status(demoJobId.trim(), demoSessionToken.trim()));
      const statusData = await statusRes.json();
      setResponse({ status: statusRes.status, data: statusData });
      
      toast({
        title: "Status Check Complete",
        description: `Status: ${statusData.status || 'unknown'}`,
      });
    } catch (error) {
      console.error('Status check error:', error);
      setResponse({ status: 'error', data: { error: 'Failed to check status' } });
      toast({
        title: "Status Check Failed",
        description: "Failed to retrieve job status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearTest = () => {
    setGuessData(Array(wordLength).fill(null).map(() => ({ letter: '', state: 'absent' as const })));
    setExcludedLetters('');
    setPositionExclusions({});
    setResponse(null);
    setPollingJobId(null);
    setPollingToken(null);
    setPollingAttempt(0);
    setDemoJobId('');
    setDemoSessionToken('');
  };

  const loadExample = () => {
    const exampleData = [
      { letter: 'C', state: 'absent' as const },
      { letter: 'R', state: 'present' as const },
      { letter: 'A', state: 'present' as const },
      { letter: 'N', state: 'absent' as const },
      { letter: 'E', state: 'correct' as const }
    ];
    setGuessData(exampleData);
    setExcludedLetters('T,I,S');
    setPositionExclusions({ 'R': [1], 'A': [2] });
    setWordLength(5);
  };

  const handlePositionExclusionChange = (letter: string, position: number) => {
    setPositionExclusions(prev => {
      const current = prev[letter] || [];
      const isExcluded = current.includes(position);
      
      if (isExcluded) {
        const updated = current.filter(p => p !== position);
        if (updated.length === 0) {
          const { [letter]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [letter]: updated };
      } else {
        return { ...prev, [letter]: [...current, position] };
      }
    });
  };

  const getPresentLetters = () => {
    const presentLetters = new Set<string>();
    guessData.forEach(tile => {
      if (tile.state === 'present' && tile.letter.trim()) {
        presentLetters.add(tile.letter.toUpperCase());
      }
    });
    return Array.from(presentLetters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive API Tester</CardTitle>
        <CardDescription>Test the Wordle AI Oracle API with your own guess data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="wordLength">Word Length</Label>
              <Select value={wordLength.toString()} onValueChange={(value) => updateWordLength(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8].map(length => (
                    <SelectItem key={length} value={length.toString()}>{length}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={loadExample} size="sm">
              Load Example
            </Button>
            
            <Button variant="outline" onClick={clearTest} size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div>
            <Label>Guess Data</Label>
            <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}>
              {guessData.map((tile, index) => (
                <div key={index} className="space-y-2">
                  <Input
                    value={tile.letter}
                    onChange={(e) => updateGuessTile(index, 'letter', e.target.value.slice(0, 1))}
                    placeholder="?"
                    className="text-center text-lg font-bold"
                    maxLength={1}
                  />
                  <Select value={tile.state} onValueChange={(value) => updateGuessTile(index, 'state', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="correct">✅ Correct</SelectItem>
                      <SelectItem value="present">🟨 Present</SelectItem>
                      <SelectItem value="absent">⬜ Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="excludedLetters">Excluded Letters (comma-separated)</Label>
            <Input
              id="excludedLetters"
              value={excludedLetters}
              onChange={(e) => setExcludedLetters(e.target.value)}
              placeholder="Enter excluded letters here (e.g., T,I,S)"
            />
          </div>

          {/* Position Exclusions */}
          {getPresentLetters().length > 0 && (
            <div className="space-y-3">
              <Label>Position Exclusions for Present Letters</Label>
              <p className="text-sm text-muted-foreground">
                Click positions where these letters should NOT be placed (they're present but in wrong positions)
              </p>
              {getPresentLetters().map(letter => (
                <div key={letter} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                      {letter}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Exclude from positions:</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: wordLength }, (_, i) => {
                      const position = i;
                      const isCurrentPosition = guessData[i]?.letter?.toUpperCase() === letter;
                      const isExcluded = positionExclusions[letter]?.includes(position);
                      
                      return (
                        <Button
                          key={position}
                          variant={isExcluded ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          disabled={isCurrentPosition}
                          onClick={() => handlePositionExclusionChange(letter, position)}
                        >
                          {position + 1}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="responseMode">Response Mode</Label>
            <Select value={responseMode} onValueChange={(value: 'immediate' | 'async' | 'auto') => setResponseMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">✅ Immediate - Get results now or fail</SelectItem>
                <SelectItem value="async">⏳ Async - Always use background processing</SelectItem>
                <SelectItem value="auto">🔄 Auto - Try immediate, fallback to async</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {responseMode === 'immediate' && "Forces synchronous processing. Returns results immediately or timeout error."}
              {responseMode === 'async' && "Always processes in background. Returns job ID for status polling."}
              {responseMode === 'auto' && "Tries immediate processing first, falls back to async if needed."}
            </p>
          </div>

          <div>
            <Label htmlFor="apiKey">API Key (optional)</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="your-api-key"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testApi} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {pollingJobId ? `Polling (${pollingAttempt}/${pollingMaxAttempts})...` : 'Testing API...'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test API
                </>
              )}
            </Button>
            
            {pollingJobId && (
              <Button variant="outline" onClick={stopPolling} className="shrink-0">
                Stop Polling
              </Button>
            )}
          </div>

          {pollingJobId && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Background Processing</span>
                <Badge variant="outline" className="text-blue-700">
                  Attempt {pollingAttempt + 1}/{pollingMaxAttempts}
                </Badge>
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div><strong>Job ID:</strong> <code className="bg-blue-100 px-1 rounded">{pollingJobId}</code></div>
                <div><strong>Session Token:</strong> <code className="bg-blue-100 px-1 rounded">{pollingToken}</code></div>
                <div><strong>Status URL:</strong> <code className="bg-blue-100 px-1 rounded">{baseUrl}/status/{pollingJobId}/{encodeURIComponent(pollingToken || '')}</code></div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold">Status Check Demo</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowStatusDemo(!showStatusDemo)}
              >
                {showStatusDemo ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showStatusDemo && (
              <div className="space-y-3 bg-slate-50 p-3 rounded">
                <p className="text-sm text-muted-foreground">
                  Test the status endpoint directly with a job ID and session token from a previous async request.
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="demoJobId">Job ID</Label>
                    <Input
                      id="demoJobId"
                      value={demoJobId}
                      onChange={(e) => setDemoJobId(e.target.value)}
                      placeholder="123e4567-e89b-12d3-a456-426614174000"
                      className="font-mono text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="demoSessionToken">Session Token</Label>
                    <Input
                      id="demoSessionToken"
                      value={demoSessionToken}
                      onChange={(e) => setDemoSessionToken(e.target.value)}
                      placeholder="abc123xyz789"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <strong>Generated URL:</strong><br/>
                  <code className="bg-white p-1 rounded border">
                    {baseUrl}/status/{demoJobId || '{job_id}'}/{demoSessionToken || '{session_token}'}
                  </code>
                </div>
                
                <Button onClick={testStatusCheck} disabled={loading} size="sm" className="w-full">
                  Check Status
                </Button>
              </div>
            )}
          </div>
        </div>

        {response && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Response:</span>
              <Badge variant={response.status === 200 ? "default" : "destructive"}>
                {response.status === 'error' ? 'Network Error' : `${response.status}`}
              </Badge>
            </div>
            
            <div className="max-h-96 w-full rounded border overflow-auto">
              <pre className="bg-slate-50 p-4 text-sm whitespace-pre-wrap font-mono">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTester;
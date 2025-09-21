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
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const updateWordLength = (newLength: number) => {
    setWordLength(newLength);
    const newGuessData = Array(newLength).fill(null).map((_, i) => 
      guessData[i] || { letter: '', state: 'absent' as const }
    );
    setGuessData(newGuessData);
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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey.trim()) {
        headers['X-API-Key'] = apiKey.trim();
      }

      const requestBody = {
        guessData: guessData.filter(tile => tile.letter.trim() !== ''),
        wordLength,
        excludedLetters: excludedLetters.split(',').map(l => l.trim().toUpperCase()).filter(l => l)
      };

      const res = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const result = await res.json();
      setResponse({ status: res.status, data: result });

      if (res.ok) {
        toast({
          title: "API Test Successful",
          description: `Received ${result.solutions?.length || 0} solutions`,
        });
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

  const clearTest = () => {
    setGuessData(Array(wordLength).fill(null).map(() => ({ letter: '', state: 'absent' as const })));
    setExcludedLetters('');
    setResponse(null);
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
    setWordLength(5);
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
              placeholder="T,I,S"
            />
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

          <Button onClick={testApi} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing API...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test API
              </>
            )}
          </Button>
        </div>

        {response && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Response:</span>
              <Badge variant={response.status === 200 ? "default" : "destructive"}>
                {response.status === 'error' ? 'Network Error' : `${response.status}`}
              </Badge>
            </div>
            
            <ScrollArea className="max-h-96 w-full rounded border">
              <pre className="bg-slate-50 p-4 text-sm whitespace-pre-wrap">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTester;
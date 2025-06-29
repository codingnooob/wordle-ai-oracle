
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { WordleSolution, AnalysisResult } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function performMLAnalysis(guessData: any[], wordLength: number, excludedLetters: string[] = []): Promise<AnalysisResult> {
  // Simulate ML processing time
  const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Call the existing analyze-wordle function
  try {
    const { data, error } = await supabase.functions.invoke('analyze-wordle', {
      body: { guessData, wordLength, excludedLetters }
    });
    
    if (error) throw error;
    
    const solutions = Array.isArray(data) ? data : [];
    const confidence = solutions.length > 0 ? 0.95 : 0.5;
    
    return {
      solutions: solutions.slice(0, 15), // Limit to top 15 results
      status: solutions.length > 0 ? 'complete' : 'partial',
      confidence
    };
  } catch (error) {
    console.error('ML Analysis failed:', error);
    return {
      solutions: [],
      status: 'failed',
      confidence: 0.0
    };
  }
}

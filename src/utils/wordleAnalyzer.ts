
import { supabase } from '@/integrations/supabase/client';

interface GuessData {
  letter: string;
  state: 'unknown' | 'absent' | 'present' | 'correct';
}

export async function analyzeGuess(guessData: GuessData[], wordLength: number): Promise<Array<{word: string, probability: number}>> {
  console.log('Analyzing guess with AI:', guessData);
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-wordle', {
      body: {
        guessData,
        wordLength
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return [];
    }

    console.log('AI analysis result:', data);
    return data || [];
  } catch (error) {
    console.error('Analysis failed:', error);
    return [];
  }
}

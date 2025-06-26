
import { supabase } from '@/integrations/supabase/client';

interface ScrapedData {
  words: string[];
  totalWords: number;
  scrapeResults: Array<{ source: string; wordCount: number; success: boolean }>;
  timestamp: string;
  fallback?: boolean;
}

export class WebScrapingService {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 5000;

  async performWebScraping(attempt = 1): Promise<ScrapedData | null> {
    try {
      console.log(`Attempting web scraping (attempt ${attempt}/${this.MAX_RETRY_ATTEMPTS})...`);
      
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: { maxWords: 10000 }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data || !data.words || !Array.isArray(data.words)) {
        throw new Error('Invalid response format from web scraper');
      }

      return data as ScrapedData;
      
    } catch (error) {
      console.error(`Web scraping attempt ${attempt} failed:`, error);
      
      if (attempt < this.MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        return this.performWebScraping(attempt + 1);
      }
      
      return null;
    }
  }
}

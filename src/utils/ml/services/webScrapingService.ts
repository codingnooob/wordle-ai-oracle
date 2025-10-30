
import { supabase } from '@/integrations/supabase/client';

interface ScrapedData {
  words: string[];
  totalWords: number;
  totalScraped?: number;
  scrapeResults: Array<{ source: string; wordCount: number; success: boolean }>;
  timestamp: string;
  fallback?: boolean;
}

export class WebScrapingService {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 5000;

  async performWebScraping(attempt = 1): Promise<ScrapedData | null> {
    try {
      console.log(`Attempting full corpus web scraping (attempt ${attempt}/${this.MAX_RETRY_ATTEMPTS})...`);
      
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: { maxWords: 100000 } // Reduced from 200K to 100K for better performance
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data || !data.words || !Array.isArray(data.words)) {
        throw new Error('Invalid response format from web scraper');
      }

      // Log the full corpus information
      if (data.totalScraped) {
        console.log(`📊 Full corpus result: ${data.totalWords} selected from ${data.totalScraped} total scraped words`);
        console.log(`📈 Corpus utilization: ${((data.totalWords / data.totalScraped) * 100).toFixed(1)}% of available words`);
      }

      return data as ScrapedData;
      
    } catch (error) {
      console.error(`Full corpus scraping attempt ${attempt} failed:`, error);
      
      if (attempt < this.MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        return this.performWebScraping(attempt + 1);
      }
      
      return null;
    }
  }
}

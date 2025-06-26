
import { pipeline } from '@huggingface/transformers';

export class ModelInitializer {
  private textGenerator: any = null;
  private textClassifier: any = null;
  private wordValidator: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing real ML models...');
    
    try {
      this.textGenerator = await pipeline(
        'text-generation',
        'microsoft/DialoGPT-small'
      );

      this.textClassifier = await pipeline(
        'text-classification',
        'distilbert-base-uncased'
      );

      this.wordValidator = await pipeline(
        'feature-extraction',
        'sentence-transformers/all-MiniLM-L6-v2'
      );

      console.log('ML models initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize ML models:', error);
      this.isInitialized = true;
    }
  }

  getTextGenerator() {
    return this.textGenerator;
  }

  getTextClassifier() {
    return this.textClassifier;
  }

  getWordValidator() {
    return this.wordValidator;
  }

  isModelInitialized(): boolean {
    return this.isInitialized;
  }
}

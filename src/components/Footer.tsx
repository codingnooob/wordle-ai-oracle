
import { Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-12 py-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-600">
          <a 
            href="https://github.com/codingnooob/wordly-ai-oracle" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-slate-800 transition-colors"
          >
            <Github size={20} />
            <span>Source Code</span>
          </a>
          
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            <span>Made with</span>
            <a 
              href="https://lovable.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Lovable
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import { Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm" style={{ 
      marginTop: 'clamp(2rem, 8vw, 3rem)',
      paddingTop: 'clamp(1.5rem, 4vw, 2rem)',
      paddingBottom: 'clamp(1.5rem, 4vw, 2rem)'
    }}>
      <div className="mx-auto" style={{
        maxWidth: 'clamp(280px, 95vw, 1200px)',
        paddingLeft: 'clamp(0.25rem, 2vw, 1rem)',
        paddingRight: 'clamp(0.25rem, 2vw, 1rem)'
      }}>
        <div className="flex flex-col sm:flex-row items-center justify-center text-slate-600" style={{ gap: 'clamp(1rem, 3vw, 1.5rem)' }}>
          <a 
            href="https://github.com/codingnooob/wordly-ai-oracle" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:text-slate-800 transition-colors" style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}
          >
            <Github style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)' }} />
            <span style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Source Code</span>
          </a>
          
          <div className="flex items-center" style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
            <Heart style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)' }} className="text-red-500" />
            <span style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Made with</span>
            <a 
              href="https://lovable.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
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


import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white/70 backdrop-blur-sm border-b border-slate-200">
      <div className="mx-auto" style={{ 
        maxWidth: 'clamp(280px, 95vw, 1200px)',
        paddingLeft: 'clamp(0.25rem, 2vw, 1rem)',
        paddingRight: 'clamp(0.25rem, 2vw, 1rem)'
      }}>
        <div className="flex items-center justify-between" style={{ 
          paddingTop: 'clamp(0.75rem, 2vw, 1rem)',
          paddingBottom: 'clamp(0.75rem, 2vw, 1rem)'
        }}>
          <Link 
            to="/" 
            className="font-bold text-slate-800 hover:text-slate-600 transition-colors"
            style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
          >
            Wordle Solver AI
          </Link>
          
          <Link 
            to="/api-docs"
            className={`text-slate-600 hover:text-slate-800 transition-colors ${
              location.pathname === '/api-docs' ? 'font-semibold text-slate-800' : ''
            }`}
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
          >
            API Documentation
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

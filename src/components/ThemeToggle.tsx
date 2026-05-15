import { useTheme } from '../providers/ThemeProvider';
import { Moon, Sun, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col p-6 border-b border-neutral-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="font-bold text-neutral-800">Apariencia</h3>
          <p className="text-xs text-neutral-500">Personaliza el tema visual</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 bg-neutral-100 p-1 rounded-2xl">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors ${
            theme === 'light' 
              ? 'bg-white text-neutral-900 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline">Claro</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors ${
            theme === 'dark' 
              ? 'bg-white text-neutral-900 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline">Oscuro</span>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors ${
            theme === 'system' 
              ? 'bg-white text-neutral-900 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span className="hidden sm:inline">Sistema</span>
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowRightLeft, Sparkles, Github, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: 'forex' | 'crypto' | 'about';
  setActiveTab: (tab: 'forex' | 'crypto' | 'about') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, darkMode, setDarkMode }) => {
  return (
    <header className="sticky top-0 z-50 bg-dark-card/90 backdrop-blur-md border-b border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('forex')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 text-dark-bg font-black" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-100">Open<span className="text-brand-500">Bit</span></span>
              <span className="text-[10px] font-mono bg-brand-500/10 text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded">v2.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Câmbio & Cripto em Tempo Real</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-dark-bg/60 p-1 rounded-xl border border-dark-border">
          <button
            onClick={() => setActiveTab('forex')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'forex'
                ? 'bg-brand-500 text-dark-bg shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Conversor de Câmbio</span>
          </button>
          
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'crypto'
                ? 'bg-brand-500 text-dark-bg shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Painel Cripto</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'about'
                ? 'bg-brand-500 text-dark-bg shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Sobre o Projeto</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <a
            href="https://github.com/gustavosergio/OpenBit"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-2 bg-dark-hover hover:bg-dark-border border border-dark-border px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
          >
            <Github className="w-4 h-4 text-brand-500" />
            <span>GitHub</span>
          </a>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-xl bg-dark-hover hover:bg-dark-border border border-dark-border flex items-center justify-center text-slate-300 transition-colors"
            title="Alternar tema"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-dark-border bg-dark-card py-2 px-4">
        <button
          onClick={() => setActiveTab('forex')}
          className={`flex flex-col items-center space-y-1 text-xs font-medium ${
            activeTab === 'forex' ? 'text-brand-500' : 'text-slate-400'
          }`}
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span>Câmbio</span>
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex flex-col items-center space-y-1 text-xs font-medium ${
            activeTab === 'crypto' ? 'text-brand-500' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Cripto</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex flex-col items-center space-y-1 text-xs font-medium ${
            activeTab === 'about' ? 'text-brand-500' : 'text-slate-400'
          }`}
        >
          <Github className="w-5 h-5" />
          <span>Sobre</span>
        </button>
      </div>
    </header>
  );
};

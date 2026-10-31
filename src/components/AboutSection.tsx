import React from 'react';
import { Terminal, Github, Code, Cpu, ShieldCheck, ExternalLink } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      
      {/* Hero Intro */}
      <div className="bg-gradient-to-r from-dark-card to-dark-subtle border border-dark-border rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Portfólio Profissional 2026</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Sobre o <span className="text-brand-500">OpenBit</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
            Desenvolvido do zero por <strong className="text-slate-100">Gustavo Sérgio</strong>, o OpenBit é um aplicativo web moderno de alta performance para monitoramento de câmbio global e criptomoedas em tempo real. Projetado com arquitetura limpa sem backend, consome APIs públicas otimizadas com cache e WebSockets ao vivo.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="https://github.com/gustavosergio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-400 text-dark-bg font-bold px-5 py-3 rounded-2xl shadow-lg shadow-brand-500/20 transition-all"
            >
              <Github className="w-5 h-5" />
              <span>GitHub de Gustavo Sérgio</span>
            </a>

            <a
              href="https://github.com/gustavosergio/OpenBit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-dark-hover hover:bg-dark-border border border-dark-border text-slate-200 font-bold px-5 py-3 rounded-2xl transition-colors"
            >
              <span>Repositório do Projeto</span>
              <ExternalLink className="w-4 h-4 text-brand-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-brand-500">
            <Code className="w-6 h-6" />
            <h3 className="font-extrabold text-lg text-slate-100">Stack Tecnológica</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-300 font-medium">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              <span><strong>Vite + React 19 + TypeScript</strong> (Strict mode)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              <span><strong>Tailwind CSS</strong> para estilização customizada</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              <span><strong>Recharts</strong> para visualização de gráficos históricos</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              <span><strong>Canvas Confetti</strong> para microinterações festivas</span>
            </li>
          </ul>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-brand-accent">
            <Cpu className="w-6 h-6" />
            <h3 className="font-extrabold text-lg text-slate-100">APIs & Dados em Tempo Real</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-300 font-medium">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
              <span><strong>Binance WebSocket Stream</strong> (Preços ao vivo por tick)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
              <span><strong>Frankfurter API & Open ER-API</strong> (Câmbio oficial)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
              <span><strong>CoinGecko Markets</strong> (Market Cap e Sparklines)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
              <span><strong>LocalStorage</strong> para persistência de favoritos</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Deployment & Architecture Note */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 text-brand-500">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="font-extrabold text-lg text-slate-100">Deploy & CI/CD no GitHub Pages</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          O projeto está configurado com GitHub Actions (<code className="font-mono text-brand-400 bg-dark-bg px-2 py-0.5 rounded">.github/workflows/deploy.yml</code>) para build estático automático e deploy no GitHub Pages.
        </p>
        <div className="bg-dark-bg p-4 rounded-2xl border border-dark-border text-xs font-mono text-slate-400 space-y-1">
          <p className="text-slate-200 font-bold">Instruções para ativar no GitHub:</p>
          <p>1. Vá até o repositório em <strong className="text-slate-200">Settings &gt; Pages</strong>.</p>
          <p>2. Em <strong>Source</strong>, selecione <strong>GitHub Actions</strong>.</p>
          <p>3. URL esperada: <strong className="text-brand-400">https://gustavosergio.github.io/OpenBit/</strong></p>
        </div>
      </div>

    </div>
  );
};

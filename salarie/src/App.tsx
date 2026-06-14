import { useState } from 'react';
import Header from './components/Header';
import SalarieForm from './components/SalarieForm';
import ResultsPanel from './components/ResultsPanel';
import { simulate } from './engine/simulate';
import { getParams } from './engine/params';
import { validate } from './engine/validate';
import type { SalarieInput, SalarieResult } from './engine/types';

export default function App() {
  const [result, setResult] = useState<SalarieResult | null>(null);
  const [lastInput, setLastInput] = useState<SalarieInput | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCalculate = (input: SalarieInput) => {
    const errs = validate(input);
    if (errs.length > 0) {
      setErrors(errs.map(e => e.message));
      return;
    }
    setErrors([]);
    const p = getParams(input.fiscalYear);
    const res = simulate(input, p);
    setResult(res);
    setLastInput(input);
    // Scroll to results on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div>
          <SalarieForm onCalculate={handleCalculate} />
          {errors.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {errors.map((e, i) => <p key={i} className="text-sm text-red-700">{e}</p>)}
            </div>
          )}
        </div>
        <div id="results">
          {result && lastInput ? (
            <ResultsPanel result={result} input={lastInput} year={lastInput.fiscalYear} />
          ) : (
            <div className="card text-center py-16 text-gray-400">
              <p className="text-4xl mb-4">📊</p>
              <p className="font-medium">Les résultats apparaîtront ici</p>
              <p className="text-sm mt-1">Renseignez le formulaire et cliquez sur "Calculer"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

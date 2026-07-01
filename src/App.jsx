import { useState, useEffect } from 'react';
import ModeSelector from './components/ModeSelector';
import OwnerModeScreen from './components/OwnerModeScreen';
import CreativeModeScreen from './components/CreativeModeScreen';
import RecipeOutput from './components/RecipeOutput';
import LoadingScreen from './components/LoadingScreen';
import fallbacks from './data/fallbacks.json';
import './App.css';

export default function App() {
  const [mode, setMode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedDrinks, setSavedDrinks] = useState([]);

  useEffect(() => {
    function handleKey(e) {
      if (e.shiftKey && e.key === 'F' && mode && !isGenerating) {
        setResult(fallbacks[mode]);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, isGenerating]);

  async function handleGenerate(input) {
    setIsGenerating(true);
    setResult(null);
    setError(null);
    try {
      const minDelay = new Promise(r => setTimeout(r, 2500));
      const apiFetch = fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input }),
      }).then(r => r.json());
      const [data] = await Promise.all([apiFetch, minDelay]);
      setResult(data);
    } catch {
      setResult(fallbacks[mode]);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    if (result) setSavedDrinks(prev => [result, ...prev]);
  }

  function handleBack() {
    setResult(null);
    setError(null);
  }

  function handleReset() {
    setMode(null);
    setResult(null);
    setError(null);
    setIsGenerating(false);
  }

  if (!mode) return <ModeSelector onSelect={setMode} />;
  if (isGenerating) return <LoadingScreen mode={mode} />;
  if (result) return <RecipeOutput result={result} onBack={handleBack} onReset={handleReset} onSave={handleSave} />;

  if (mode === 'owner') return <OwnerModeScreen onGenerate={handleGenerate} onBack={handleReset} />;
  if (mode === 'creative') return <CreativeModeScreen onGenerate={handleGenerate} onBack={handleReset} />;
  return null;
}

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ModeSelector from './components/ModeSelector';
import OwnerModeScreen from './components/OwnerModeScreen';
import CreativeModeScreen from './components/CreativeModeScreen';
import RecipeOutput from './components/RecipeOutput';
import LoadingScreen from './components/LoadingScreen';
import Loader from './components/Loader';
import fallbacks from './data/fallbacks.json';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [mode, setMode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
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

  function handleBack() { setResult(null); }
  function handleReset() { setMode(null); setResult(null); setIsGenerating(false); }

  let screen;
  if (isGenerating) {
    screen = <LoadingScreen key="loading" mode={mode} />;
  } else if (result) {
    screen = <RecipeOutput key="output" result={result} onBack={handleBack} onReset={handleReset} onSave={handleSave} />;
  } else if (mode === 'owner') {
    screen = <OwnerModeScreen key="owner" onGenerate={handleGenerate} onBack={handleReset} />;
  } else if (mode === 'creative') {
    screen = <CreativeModeScreen key="creative" onGenerate={handleGenerate} onBack={handleReset} />;
  } else {
    screen = <ModeSelector key="home" onSelect={setMode} />;
  }

  return (
    <>
      {/* Loader overlays everything, exits on its own via position:fixed */}
      <AnimatePresence>
        {!appReady && <Loader key="loader" onDone={() => setAppReady(true)} />}
      </AnimatePresence>

      {/* Main app content — renders behind loader, transitions between screens */}
      <AnimatePresence mode="wait">
        {screen}
      </AnimatePresence>
    </>
  );
}

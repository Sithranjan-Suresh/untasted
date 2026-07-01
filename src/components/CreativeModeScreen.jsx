import { useState } from 'react';

const MAX_CHARS = 300;

const PLACEHOLDERS = [
  'A rainy afternoon in a library with old wooden shelves…',
  'That first hour of morning when the world is still quiet…',
  'Warm, spicy, and a little mysterious…',
  'Something that tastes like autumn in a cup…',
  'Bright and floral, like a garden in full bloom…',
];

export default function CreativeModeScreen({ onGenerate, onBack }) {
  const [vibe, setVibe] = useState('');
  const [showError, setShowError] = useState(false);
  const placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

  function handleSubmit() {
    if (!vibe.trim()) {
      setShowError(true);
      return;
    }
    onGenerate(vibe.trim());
  }

  return (
    <div className="screen screen--creative">
      <div className="screen__header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="screen__title">Creative Mode</h2>
        <p className="screen__subtitle">Describe a mood, a moment, a craving. We'll invent the drink.</p>
      </div>
      <div className="screen__body">
        <div className="vibe-input">
          <textarea
            className={`vibe-input__textarea ${showError ? 'vibe-input__textarea--error' : ''}`}
            placeholder={placeholder}
            value={vibe}
            maxLength={MAX_CHARS}
            onChange={e => {
              setVibe(e.target.value);
              if (showError) setShowError(false);
            }}
            rows={5}
          />
          <div className="vibe-input__meta">
            {showError && <span className="vibe-input__error">Describe something — anything!</span>}
            <span className="vibe-input__counter">{vibe.length} / {MAX_CHARS}</span>
          </div>
        </div>
      </div>
      <div className="screen__footer">
        <button className="cta-btn" onClick={handleSubmit}>
          Invent My Drink →
        </button>
      </div>
    </div>
  );
}

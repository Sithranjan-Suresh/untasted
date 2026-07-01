import { useState } from 'react';
import IngredientChecklist from './IngredientChecklist';

export default function OwnerModeScreen({ onGenerate, onBack }) {
  const [selected, setSelected] = useState([]);

  return (
    <div className="screen screen--owner">
      <div className="screen__header">
        <div className="screen__topbar">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="screen__wordmark">untasted</span>
        </div>
        <h2 className="screen__title">Owner Mode</h2>
        <p className="screen__subtitle">Which ingredients do you need to use up?</p>
      </div>
      <div className="screen__body">
        <IngredientChecklist selected={selected} onChange={setSelected} />
      </div>
      <div className="screen__footer">
        <div className="screen__selection-count">
          {selected.length} / 4 selected
        </div>
        <button
          className="cta-btn"
          disabled={selected.length < 2}
          onClick={() => onGenerate(selected)}
        >
          Generate Drink →
        </button>
      </div>
    </div>
  );
}

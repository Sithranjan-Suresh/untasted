import ingredients from '../data/ingredients.json';

const CATEGORY_LABELS = {
  espresso: 'Espresso',
  dairy: 'Dairy & Milk',
  syrup: 'Syrups & Sweeteners',
  spice: 'Spices',
  'add-in': 'Add-ins & Extras',
};

export default function IngredientChecklist({ selected, onChange }) {
  const categories = [...new Set(ingredients.map(i => i.category))];

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < 4) {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="checklist">
      {selected.length < 2 && (
        <p className="checklist__hint">Select 2–4 ingredients to continue</p>
      )}
      {selected.length === 4 && (
        <p className="checklist__hint checklist__hint--max">Maximum reached (4 ingredients)</p>
      )}
      {categories.map(cat => (
        <div key={cat} className="checklist__group">
          <h3 className="checklist__group-label">{CATEGORY_LABELS[cat] ?? cat}</h3>
          <div className="checklist__chips">
            {ingredients.filter(i => i.category === cat).map(ing => {
              const isSelected = selected.includes(ing.id);
              const isDisabled = !isSelected && selected.length >= 4;
              return (
                <button
                  key={ing.id}
                  className={`chip ${isSelected ? 'chip--selected' : ''} ${isDisabled ? 'chip--disabled' : ''}`}
                  onClick={() => toggle(ing.id)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                >
                  {isSelected && <span className="chip__check">✓</span>}
                  {ing.name}
                  {ing.mock_stock_quantity <= 10 && (
                    <span className="chip__low-stock" title="Low stock">⚠</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

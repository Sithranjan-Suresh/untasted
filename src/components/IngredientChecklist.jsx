import { useState } from 'react';
import ingredients from '../data/ingredients.json';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  espresso: 'Espresso',
  dairy: 'Dairy & Milk',
  syrup: 'Syrups',
  spice: 'Spices & Herbs',
  'add-in': 'Add-ins & Extras',
  fruit: 'Fruit & Citrus',
  tea: 'Tea & Botanicals',
  sweetener: 'Sweeteners',
  flavor: 'Flavors & Extracts',
  topping: 'Toppings',
};

const grouped = ingredients.reduce((acc, ing) => {
  const cat = ing.category;
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(ing);
  return acc;
}, {});

const chipVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 360, damping: 22 } },
};

export default function IngredientChecklist({ selected, onChange, maxSelect = 8 }) {
  const [query, setQuery] = useState('');

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < maxSelect) {
      onChange([...selected, id]);
    }
  }

  const q = query.toLowerCase().trim();

  const filteredGrouped = Object.entries(grouped).reduce((acc, [cat, items]) => {
    const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q)) : items;
    if (filtered.length) acc[cat] = filtered;
    return acc;
  }, {});

  const totalVisible = Object.values(filteredGrouped).reduce((s, arr) => s + arr.length, 0);

  return (
    <div>
      {/* Search bar */}
      <div className="checklist__search-wrap">
        <span className="checklist__search-icon">🔍</span>
        <input
          className="checklist__search"
          type="text"
          placeholder="Search ingredients…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="checklist__search-clear" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      <div className="checklist__hint">
        Pick 2–{maxSelect} surplus ingredients ({selected.length} selected)
        {q && ` · ${totalVisible} match`}
      </div>

      <motion.div
        key={q}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {Object.entries(filteredGrouped).map(([cat, items]) => (
          <div key={cat} className="checklist__group">
            <div className="checklist__group-label">
              {CATEGORY_LABELS[cat] ?? cat}
            </div>
            <div className="checklist__chips">
              {items.map(ing => {
                const isSelected = selected.includes(ing.id);
                const isDisabled = !isSelected && selected.length >= maxSelect;
                const lowStock = ing.mock_stock_quantity < 3;
                const nearExpiry = ing.days_until_expiry != null && ing.days_until_expiry <= 3;
                return (
                  <motion.button
                    key={ing.id}
                    variants={chipVariant}
                    initial="hidden"
                    animate="show"
                    className={`neo-chip ${isSelected ? 'neo-chip--selected' : ''} ${isDisabled ? 'neo-chip--disabled' : ''}`}
                    onClick={() => toggle(ing.id)}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { scale: 1.06 } : {}}
                    whileTap={!isDisabled ? { scale: 0.94 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    {isSelected ? '✓ ' : ''}{ing.name}
                    {nearExpiry && (
                      <span className="neo-chip__expiry">⚠️ {ing.days_until_expiry}d</span>
                    )}
                    {!nearExpiry && lowStock && <span className="neo-chip__low-stock">low stock</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
        {totalVisible === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#a08060', fontWeight: 600 }}>
            No ingredients match "{query}"
          </div>
        )}
      </motion.div>
    </div>
  );
}

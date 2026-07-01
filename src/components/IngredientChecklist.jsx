import ingredients from '../data/ingredients.json';
import { motion } from 'framer-motion';

const CATEGORY_LABELS = {
  espresso: 'Espresso',
  dairy: 'Dairy & Milk',
  syrup: 'Syrups',
  spice: 'Spices & Herbs',
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const chipVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 360, damping: 22 } },
};

export default function IngredientChecklist({ selected, onChange, maxSelect = 8 }) {
  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < maxSelect) {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <div className="checklist__hint">
        Pick 2–{maxSelect} surplus ingredients ({selected.length} selected)
      </div>

      <motion.div variants={container} initial="hidden" animate="show">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="checklist__group">
            <div className="checklist__group-label">
              {CATEGORY_LABELS[cat] ?? cat}
            </div>
            <div className="checklist__chips">
              {items.map(ing => {
                const isSelected = selected.includes(ing.id);
                const isDisabled = !isSelected && selected.length >= maxSelect;
                const lowStock = ing.mock_stock_quantity < 3;
                return (
                  <motion.button
                    key={ing.id}
                    variants={chipVariant}
                    className={`neo-chip ${isSelected ? 'neo-chip--selected' : ''} ${isDisabled ? 'neo-chip--disabled' : ''}`}
                    onClick={() => toggle(ing.id)}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { scale: 1.06 } : {}}
                    whileTap={!isDisabled ? { scale: 0.94 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    {isSelected ? '✓ ' : ''}{ing.name}
                    {lowStock && <span className="neo-chip__low-stock">low stock</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

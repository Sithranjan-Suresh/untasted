export default function ModeSelector({ onSelect }) {
  return (
    <div className="mode-selector">
      <div className="mode-selector__header">
        <h1 className="mode-selector__logo">untasted</h1>
        <p className="mode-selector__tagline">An AI engine that invents coffee drinks from scratch.</p>
      </div>
      <div className="mode-selector__cards">
        <button className="mode-card mode-card--owner" onClick={() => onSelect('owner')}>
          <span className="mode-card__icon">♻️</span>
          <h2 className="mode-card__title">Owner Mode</h2>
          <p className="mode-card__desc">
            Select overstocked or near-expiry ingredients. Get a costed, buildable recipe that turns waste into a sellable drink.
          </p>
          <span className="mode-card__cta">Reduce Waste →</span>
        </button>
        <button className="mode-card mode-card--creative" onClick={() => onSelect('creative')}>
          <span className="mode-card__icon">✦</span>
          <h2 className="mode-card__title">Creative Mode</h2>
          <p className="mode-card__desc">
            Describe a feeling, a moment, a craving. Get an entirely new drink invented for you — with a name, artwork, and an explanation of every choice.
          </p>
          <span className="mode-card__cta">Invent a Drink →</span>
        </button>
      </div>
      <p className="mode-selector__footnote">Same flavor engine. Two very different payoffs.</p>
      <p className="mode-selector__demo-hint">Demo tip: press <kbd>Shift+F</kbd> at any time to load a saved example instantly.</p>
    </div>
  );
}

# ☕ Untasted — AI Coffee Drink Invention Engine

> **BeanHacks 2026** · Turn surplus into tomorrow's special.

Cafés lose an average of **$1,200/month** to ingredient waste. Untasted uses flavor chemistry — not guesswork — to turn that surplus into a barista-quality named recipe, complete with a cost estimate, buildability check, margin projection, and AI artwork.

---

## BeanHacks 2026 — Criteria Alignment

| Criterion | How Untasted addresses it |
|---|---|
| **Waste Reduction** | Owner Mode converts near-expiry ingredients into sellable recipes before they expire — each output shows exactly which surplus items are rescued |
| **Inventory Optimization** | Expiry-aware ingredient picker flags items expiring in ≤3 days; buildability check confirms recipe is makeable from current stock |
| **Profitability & Sales Analytics** | Every Owner Mode recipe includes cost-per-cup, estimated sell price, and margin per cup at standard café markup |
| **Innovation** | Core engine is a real cosine similarity algorithm over hand-crafted 8-dimension flavor vectors — not a prompt wrapper |
| **Customer Experience** | Creative Mode lets customers describe a mood/vibe and get a genuinely invented drink, complete with AI artwork |

---

## The Problem

Café owners throw out near-expiry syrups, specialty milks, and seasonal add-ins because they don't know what to make with them. The result: wasted ingredients, lost margin, and a menu that never changes.

## The Solution

Untasted runs **cosine similarity matching across an 8-dimension flavor vector** (sweetness, bitterness, roastiness, spice, brightness, creaminess, warmth, complexity) to find which ingredients pair best, then uses an LLM to generate a unique named drink with precise barista-quality steps.

---

## Two Modes

### 🏪 Owner Mode
Select your surplus stock from 40+ café ingredients. Untasted:
- Builds a target flavor profile from your selection
- Runs cosine similarity to find the best-matching combinations
- Generates a named recipe with exact quantities and steps
- Shows estimated cost per drink, sell price, and margin per cup
- Flags near-expiry items (≤3 days) and confirms buildability from stock
- Shows how many near-expiry items the recipe keeps off the bin

### 🎨 Creative Mode
Describe a mood or vibe in plain text ("rainy afternoon in a library"). Untasted:
- Parses your description into an 8D flavor profile using an LLM
- Visualises the parsed profile (sweetness: 9/10, warmth: 8/10…) in real time
- Matches ingredients to that profile via cosine similarity
- Generates a drink name, recipe steps, and AI artwork (via Pollinations)

---

## How the Flavor Engine Works

Each of 40+ ingredients has a hand-crafted 8-dimension flavor profile (values 0–10):

```
sweetness · bitterness · roastiness · spice · brightness · creaminess · warmth · complexity
```

When you select ingredients (Owner Mode) or describe a vibe (Creative Mode), Untasted:
1. Builds a **target flavor vector** (average of selected profiles, or LLM-parsed from vibe text)
2. Computes **cosine similarity** between the target and every ingredient in the library
3. Applies a **diversity filter** — drops same-category duplicates within 0.05 similarity score
4. Returns the top 5 matches, which anchor the LLM recipe generation

This is a real algorithmic matching system, not a prompt wrapper.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, framer-motion, Recharts |
| Backend | Vercel Serverless Functions (Node 24) |
| LLM | Groq API (`llama-3.3-70b-versatile`) |
| AI Artwork | Pollinations.ai (free, no key required) |
| Flavor Matching | Custom cosine similarity (8D vectors) |
| Styling | Neo-brutalist CSS system, Space Grotesk |

---

## Running Locally

```bash
git clone https://github.com/Sithranjan-Suresh/untasted.git
cd untasted
npm install
```

Create a `.env` file:
```
GROQ_API_KEY=your_groq_api_key_here
```

Run with Vercel CLI (required for the API route):
```bash
npx vercel dev --listen 3000
```

Open [http://localhost:3000](http://localhost:3000).

> **No Groq key?** The app falls back to curated example results (Lavender Dusk, The Archivist) automatically. Press **Shift+F** at any time during a demo to load a fallback instantly.

---

## Project Structure

```
src/
  components/
    ModeSelector.jsx      # Landing page with mode selection
    OwnerModeScreen.jsx   # Ingredient selection + live flavor preview
    CreativeModeScreen.jsx# Vibe text input
    RecipeOutput.jsx      # Full recipe output with chart, steps, reasons
    FlavorProfileChart.jsx# Animated 8D radar chart (Recharts)
    IngredientChecklist.jsx # Searchable ingredient picker
    LoadingScreen.jsx     # Animated loading with brew facts + vibe parse reveal
    Loader.jsx            # Splash screen
  data/
    ingredients.json      # 40 ingredients with 8D flavor profiles + cost + expiry data
    fallbacks.json        # Pre-generated example results
  utils/
    matching.js           # Cosine similarity engine + diversity filter
    profileBuilder.js     # Builds flavor profile from selected ingredient IDs
api/
  generate.js             # Vercel serverless function — LLM orchestration
```

---

## Demo Safety

- **Shift+F** anywhere in the app loads a pre-generated fallback result instantly
- All LLM calls have a 14-second total timeout with automatic fallback
- Artwork failures gracefully degrade to a shimmer loader then a placeholder

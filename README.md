# Pathfinder 1E Forge

A free, open-source character generator for the Pathfinder Roleplaying Game (1st Edition).
Inspired by Hero Lab and D&D Beyond — but runs entirely in your browser, with no account, no telemetry, and no license needed.

## Features

- All 7 Core Rulebook races
- All 11 Core Rulebook classes with full level 1–20 progressions (BAB, saves, features, spells per day)
- All 35 standard skills with class-skill bonuses
- A representative selection of core feats, spells, weapons, armor, and adventuring gear
- 9-step character creation wizard
- Multiclassing
- Printable character sheet view
- Save to browser localStorage; export / import as JSON

## Run locally

Requires Node 18+.

```bash
npm install
npm run dev
```

Visit the URL printed by Vite (usually http://localhost:5173).

To build the static site for hosting on GitHub Pages, Netlify, Vercel, etc.:

```bash
npm run build
# Output is in ./dist
```

## Project layout

```
src/
  types/        # TypeScript types for the data model
  data/         # OGL rules content
    races/      # Race definitions
    classes/    # Class definitions and spell progression tables
    feats/      # Feat catalog
    spells/     # Spell catalog
    equipment/  # Weapons, armor, gear
    skills/     # The standard skill list
  engine/       # Derived-stat computation (BAB, saves, AC, HP, skills, …)
  store/        # zustand store with localStorage persistence
  components/   # Layout + shared UI
  pages/        # CharacterList, CharacterWizard, CharacterSheet, About
```

## Roadmap

The schema is intentionally open-ended so the full Paizo 1E catalog can be added
incrementally without code changes:

- Advanced Player's Guide (alchemist, cavalier, inquisitor, oracle, summoner, witch)
- Ultimate Magic / Combat / Equipment expansions
- Hybrid classes (Advanced Class Guide)
- Occult classes (Occult Adventures)
- Archetypes and prestige classes
- Traits and drawbacks
- The full ~700-feat catalog and ~1000-spell catalog
- Magic item creation, NPC building, encounter math

Pull requests with OGL-licensed content are welcome.

## License

Source code: MIT.

Open Game Content used here is from the Pathfinder Roleplaying Game Core
Rulebook (Paizo Publishing, LLC) and is used under the Open Game License
v1.0a. The Pathfinder name, logo, and associated marks are trademarks of
Paizo Inc., used under the Community Use Policy. This project is unofficial
and not endorsed by Paizo.

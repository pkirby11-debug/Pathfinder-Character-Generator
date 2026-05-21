export function About() {
  return (
    <div className="prose max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl">About</h1>
      <p className="font-flavor">
        Pathfinder 1E Forge is a free, open-source character generator for the Pathfinder
        Roleplaying Game (1st Edition). All rules content used here is published under
        the Open Game License v1.0a.
      </p>

      <h2 className="text-xl">What's included</h2>
      <ul className="list-disc ml-6 text-sm space-y-1">
        <li>All 7 Core Rulebook races (human, elf, dwarf, halfling, gnome, half-elf, half-orc).</li>
        <li>All 11 Core Rulebook classes, level 1–20, with BAB / save progressions, features, and spell slots.</li>
        <li>All 35 standard skills.</li>
        <li>A representative selection of core feats, spells, weapons, armor, and adventuring gear.</li>
        <li>A 9-step character creation wizard.</li>
        <li>A printable character sheet view.</li>
        <li>Local-browser save, plus JSON export/import.</li>
      </ul>

      <h2 className="text-xl">What's coming</h2>
      <p className="text-sm">
        The schema is designed to hold the full Paizo 1E catalog — Advanced Player's
        Guide, Ultimate Magic / Combat / Equipment, the hybrid and occult classes,
        archetypes, prestige classes, traits, drawbacks, and so on. These will be added
        in follow-up releases. Pull requests with OGL content are welcome.
      </p>

      <h2 className="text-xl">Privacy</h2>
      <p className="text-sm">
        Everything runs in your browser. Characters are stored in your browser's
        localStorage. No accounts, no telemetry, no server.
      </p>

      <h2 className="text-xl">Open Game License</h2>
      <p className="text-sm font-flavor">
        Open Game Content used here is from the Pathfinder Roleplaying Game Core
        Rulebook (Paizo Publishing, LLC) and other OGL-licensed sources. The Pathfinder
        name, logo, and associated marks are trademarks of Paizo Inc., used under the
        Community Use Policy. This project is unofficial and not endorsed by Paizo.
      </p>
    </div>
  );
}

import { Link, NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-ink-900 text-parchment-100 border-b-4 border-rust-600 no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="text-2xl font-display font-bold tracking-wide hover:text-parchment-50">
            Pathfinder 1E Forge
          </Link>
          <nav className="flex gap-4 text-sm font-display">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? "text-parchment-50 underline underline-offset-4"
                  : "text-parchment-200 hover:text-parchment-50"
              }
            >
              Characters
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-parchment-50 underline underline-offset-4"
                  : "text-parchment-200 hover:text-parchment-50"
              }
            >
              About
            </NavLink>
          </nav>
          <div className="ml-auto text-xs text-parchment-300 hidden sm:block font-flavor">
            unofficial, fan-made, OGL content
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-ink-700 py-4 no-print font-flavor">
        Pathfinder and associated marks and logos are trademarks of Paizo Inc., used under the Open Game License.
      </footer>
    </div>
  );
}

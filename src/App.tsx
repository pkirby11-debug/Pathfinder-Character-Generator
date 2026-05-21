import { createHashRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CharacterList } from "./pages/CharacterList";
import { CharacterWizard } from "./pages/CharacterWizard";
import { CharacterSheet } from "./pages/CharacterSheet";
import { About } from "./pages/About";

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <CharacterList /> },
      { path: "about", element: <About /> },
      { path: "character/:id", element: <CharacterSheet /> },
      { path: "character/:id/wizard", element: <CharacterWizard /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

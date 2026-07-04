import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { detectSupabaseTables } from "./integrations/supabase/setupTables";

// Auto-detect Supabase tables on startup
detectSupabaseTables();

createRoot(document.getElementById("root")!).render(<App />);

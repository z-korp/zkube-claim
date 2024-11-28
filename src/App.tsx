import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Toaster } from "./ui/elements/sonner";
import { TooltipProvider } from "@/ui/elements/tooltip";
import { Header } from "./ui/containers/Header";
import { HomePage } from "./ui/screens/Home";
import { AdminPage } from "./ui/screens/Admin";
import { SponsoPage } from "./ui/screens/Sponso";
import { StatsPage } from "./ui/screens/Stats";
import { MintCheckPage } from "./ui/screens/MintCheck";

const Layout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col w-full">
      <Header />
      <div className={`flex-1 overflow-hidden`}>
        <Outlet />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/sponso" element={<SponsoPage />} />
            <Route path="/mint-check" element={<MintCheckPage />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" />
      </Router>
    </TooltipProvider>
  );
};

export default App;

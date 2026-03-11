import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-inner page-container">
        <Link to="/" className="app-header-brand">
          Candidate Search
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

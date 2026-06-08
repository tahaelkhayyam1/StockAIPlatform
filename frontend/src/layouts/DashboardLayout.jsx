import { logout } from "../auth/auth";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px" }}>
        <h3>StockAI</h3>

        <button onClick={handleLogout}>Logout</button>
      </nav>

      <hr />

      <div>{children}</div>
    </div>
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import StockPage from "./pages/StockPage";
import ReorderPage from "./pages/ReorderPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        <Route
          path="/stock"
          element={
            <MainLayout>
              <StockPage />
            </MainLayout>
          }
        />

        <Route
          path="/reorder"
          element={
            <MainLayout>
              <ReorderPage />
            </MainLayout>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
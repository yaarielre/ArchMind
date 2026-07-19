import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { Dashboard } from "./pages/Dashboard";
import { Upload } from "./pages/Upload";
import { ProjectDetail } from "./pages/ProjectDetail";
import { AIEnrichPage } from "./pages/AIEnrichPage";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/project/:id/ai" element={<AIEnrichPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

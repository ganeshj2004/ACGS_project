import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/Auth/LoginPage";


// Lazy imports for pages
const LanguagePage = lazy(
  () => import("./pages/commonPage/LanguagePage/LanguagePage.jsx"),
);
const ProjectPage = lazy(
  () => import("./pages/commonPage/ProjectPage/ProjectPage.jsx"),
);
const ModulePage = lazy(
  () => import("./pages/commonPage/ModulePage/ModulePage.jsx"),
);
const DbConnectionPage = lazy(
  () => import("./pages/commonPage/DbConnectionPage/DbConnectionPage.jsx"),
);
const LovPage = lazy(() => import("./pages/commonPage/LovPage/LovPage.jsx"));
const LovDetailsPage = lazy(
  () => import("./pages/commonPage/LovDetailsPage/LovDetailsPage.jsx"),
);
const ErrorMsgPage = lazy(
  () => import("./pages/commonPage/ErrorMsg/ErrorMsgPage.jsx"),
);
const ProductPage = lazy(
  () => import("./pages/commonPage/ProductPage/ProductPage.jsx"),
);
const GenPage = lazy(() => import("./pages/mySQLTool/GenPage/GenPage.jsx"));
const UserPage = lazy(() => import("./pages/commonPage/UserPage/UserPage.jsx"));
const UserProjectPage = lazy(() => import("./pages/commonPage/UserProjectPage/UserProjectPage.jsx"));
const DeveloperDashboard = lazy(() => import("./pages/Developer/DeveloperDashboard.jsx"));


const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.Role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Suspense will show fallback UI while the component is being loaded */}
        <Suspense
          fallback={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin Routes */}
            <Route path="/language" element={<ProtectedRoute allowedRole="Admin"><LanguagePage /></ProtectedRoute>} />
            <Route path="/project" element={<ProtectedRoute allowedRole="Admin"><ProjectPage /></ProtectedRoute>} />
            <Route path="/module" element={<ProtectedRoute allowedRole="Admin"><ModulePage /></ProtectedRoute>} />
            <Route path="/dbconnect" element={<ProtectedRoute allowedRole="Admin"><DbConnectionPage /></ProtectedRoute>} />
            <Route path="/lov" element={<ProtectedRoute allowedRole="Admin"><LovPage /></ProtectedRoute>} />
            <Route path="/lov-det" element={<ProtectedRoute allowedRole="Admin"><LovDetailsPage /></ProtectedRoute>} />
            <Route path="/err-msg" element={<ProtectedRoute allowedRole="Admin"><ErrorMsgPage /></ProtectedRoute>} />
            <Route path="/product" element={<ProtectedRoute allowedRole="Admin"><ProductPage /></ProtectedRoute>} />
            <Route path="/user" element={<ProtectedRoute allowedRole="Admin"><UserPage /></ProtectedRoute>} />
            <Route path="/user-project" element={<ProtectedRoute allowedRole="Admin"><UserProjectPage /></ProtectedRoute>} />
            
            {/* Developer Routes */}

            <Route path="/developer-dashboard" element={<ProtectedRoute allowedRole="Developer"><DeveloperDashboard /></ProtectedRoute>} />
            <Route path="/gen-page" element={<ProtectedRoute allowedRole="Developer"><GenPage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}


export default App;

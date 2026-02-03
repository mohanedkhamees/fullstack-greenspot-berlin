import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginScreen from "./pages/LoginScreen";
import LocationsListScreen from "./pages/LocationsListScreen";
import LocationDetailScreen from "./pages/LocationDetailScreen";
import EditLocationScreen from "./pages/EditLocationScreen";
import CreateNewLocationScreen from "./pages/CreateNewLocationScreen";
import MapScreen from "./pages/MapScreen";
import AboutScreen from "./pages/AboutScreen";
import ErrorScreen from "./pages/ErrorScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="/locations"
        element={
          <ProtectedRoute>
            <LocationsListScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations/:id"
        element={
          <ProtectedRoute>
            <LocationDetailScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations/:id/edit"
        element={
          <ProtectedRoute requireAdmin={true}>
            <EditLocationScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations/add"
        element={
          <ProtectedRoute requireAdmin={true}>
            <CreateNewLocationScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations/map"
        element={
          <ProtectedRoute>
            <MapScreen />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/error" element={<ErrorScreen />} />
      <Route path="/" element={<Navigate to="/locations" replace />} />
      <Route path="*" element={<Navigate to="/error" replace />} />
    </Routes>
  );
}


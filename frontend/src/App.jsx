import React, { useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import "./global.css";
import "./index.css";
import ImageUpload from "./admin/ImageUpload.jsx";
import AllResult from "./admin/AllResult.jsx";
import ScoreAd from "./admin/ScoreAd.jsx";
import Login from "./admin/Login.jsx";
import ProtectedRoute from "./admin/ProtectedRoute.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AddBrochure from "./admin/AddBrochure.jsx";
import AddTeam from "./admin/AddTeam.jsx";
import AddCategory from "./admin/AddCategory.jsx";
import AddItem from "./admin/AddItem.jsx";
import StartProgram from "./admin/StartProgram.jsx";
import AddResults from "./admin/AddResults.jsx";
import GalleryPage from "./users/GalleryPage.jsx";
import AddGallery from "./admin/AddGallery.jsx";
import AddYoutubeLink from "./admin/AddYoutubeLink.jsx";
import AboutPage from "./admin/AboutPage.jsx";
import FeatureToggle from "./admin/FeatureToggle.jsx";
import Settings from "./admin/Settings.jsx";
import UploadAds from "./admin/UploadAds.jsx";
import { AuthContext } from "./context/AuthContext.jsx";
import VideoPage from "./users/VideoPage.jsx";
import MapPage from "./users/MapPage.jsx";
import NewsDetails from "./components/NewsDetails.jsx";
import NewsAdd from "./admin/NewsAdd.jsx";
import StudentDetailsPage from "./users/StudentDetailsPage.jsx";

// Portal Pages
import RightSidebarLayout from "./users/RightSidebarLayout.jsx";
import HitsDifferent from "./users/HitsDifferent.jsx";
import { getFullEventTitle, getEventConfig } from "./api/apiCall";
import { ShieldAlert } from "lucide-react";

function App() {
  const { isAdminLoggedIn, loading } = useContext(AuthContext);
  const [eventConfig, setEventConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getEventConfig();
        if (res && res.success && res.data) {
          setEventConfig(res.data);
        }
      } catch (err) {
        console.error("Failed to load event configuration:", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (eventConfig) {
      document.title = getFullEventTitle(eventConfig);
    }
  }, [eventConfig]);

  if (loading || configLoading) {
    return (
      <div className="h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Resolving Portal...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Home Portal */}
        <Route
          path="/"
          element={
            eventConfig ? (
              <RightSidebarLayout key={eventConfig._id} festival={eventConfig} />
            ) : (
              <div className="h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="bg-red-950/45 p-4 rounded-full border border-red-800 text-red-500 shadow-lg">
                  <ShieldAlert className="h-12 w-12" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h2 className="text-2xl font-black">Portal Not Found</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This portal could not be loaded. Please ensure settings are configured in the admin panel.
                  </p>
                </div>
              </div>
            )
          }
        />



        {/* Other Public views */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/news/:id/:user" element={<NewsDetails />} />
        <Route path="/gallerypage" element={<GalleryPage />} />
        <Route path="/videopage" element={<VideoPage />} />
        <Route path="/hits-different" element={<HitsDifferent />} />
        <Route path="/student" element={<StudentDetailsPage />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={
            isAdminLoggedIn ? <Navigate to="/admin" /> : <Login />
          }
        />

        {/* Festival Admin Modules */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addImage"
          element={
            <ProtectedRoute>
              <ImageUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/allresult"
          element={
            <ProtectedRoute>
              <AllResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addteampoint"
          element={
            <ProtectedRoute>
              <ScoreAd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addbrochure"
          element={
            <ProtectedRoute>
              <AddBrochure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addteam"
          element={
            <ProtectedRoute>
              <AddTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addnews"
          element={
            <ProtectedRoute>
              <NewsAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addcategory"
          element={
            <ProtectedRoute>
              <AddCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/additem"
          element={
            <ProtectedRoute>
              <AddItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/start"
          element={
            <ProtectedRoute>
              <StartProgram />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addresult"
          element={
            <ProtectedRoute>
              <AddResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addgallery"
          element={
            <ProtectedRoute>
              <AddGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addvideos"
          element={
            <ProtectedRoute>
              <AddYoutubeLink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/featuretoggle"
          element={
            <ProtectedRoute>
              <FeatureToggle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/upload-ads"
          element={
            <ProtectedRoute>
              <UploadAds />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
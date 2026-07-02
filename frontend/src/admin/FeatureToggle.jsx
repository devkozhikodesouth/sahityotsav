import { useEffect, useState } from "react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiLoader,
} from "react-icons/fi";

import toast, { Toaster } from "react-hot-toast";

import {
  getFeatures,
  resetFeature,
  setfeature,
} from "../api/apiCall";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function FeatureToggle() {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  // ==============================
  // Fetch Features
  // ==============================
  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    setLoading(true);

    try {
      const res = await toast.promise(getFeatures(), {
        loading: "Loading features...",
        success: "Features loaded successfully ✅",
        error: "Failed to load features ❌",
      });

      setFeatures(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Toggle Feature
  // ==============================
  const updateFeature = async (name, current) => {
    setUpdating(name);

    try {
      const res = await toast.promise(
        setfeature({
          name,
          enabled: !current,
        }),
        {
          loading: `${current ? "Disabling" : "Enabling"} feature...`,
          success: `Feature ${
            current ? "disabled" : "enabled"
          } successfully ✅`,
          error: "Feature update failed ❌",
        }
      );

      setFeatures((prev) =>
        prev.map((item) =>
          item.name === name ? res : item
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating("");
    }
  };

  // ==============================
  // Reset Features
  // ==============================
  const resetFeatures = async () => {
    try {
      const res = await toast.promise(resetFeature(), {
        loading: "Resetting all features...",
        success: "All features reset successfully 🔄",
        error: "Reset failed ❌",
      });

      setFeatures(res.features);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10 relative">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              {/* Left */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <FiSettings className="text-blue-600 text-2xl" />
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Feature Control Panel
                    </h1>

                    <p className="text-gray-500 text-sm md:text-base">
                      Manage and control all system features
                    </p>
                  </div>
                </div>
              </div>

              {/* Right */}
              <button
                onClick={resetFeatures}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 hover:scale-[1.02]"
              >
                <FiRefreshCw className="text-lg" />
                Reset Features
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FiLoader className="animate-spin text-5xl text-blue-600 mb-4" />

              <p className="text-gray-500 text-lg">
                Loading Features...
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-gray-500 text-sm mb-1">
                    Total Features
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900">
                    {features.length}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-gray-500 text-sm mb-1">
                    Enabled
                  </p>

                  <h2 className="text-3xl font-bold text-green-600">
                    {
                      features.filter((f) => f.enabled)
                        .length
                    }
                  </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-gray-500 text-sm mb-1">
                    Disabled
                  </p>

                  <h2 className="text-3xl font-bold text-red-500">
                    {
                      features.filter((f) => !f.enabled)
                        .length
                    }
                  </h2>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {features.map((feature) => (
                  <div
                    key={feature.name}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Top */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        {/* Feature Info */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize mb-1">
                            {feature.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            System feature configuration
                          </p>
                        </div>

                        {/* Status Icon */}
                        <div>
                          {feature.enabled ? (
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                              <FiCheckCircle className="text-green-600 text-2xl" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                              <FiXCircle className="text-red-500 text-2xl" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-gray-600 font-medium">
                          Current Status
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            feature.enabled
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {feature.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>

                      {/* Toggle Button */}
                      <button
                        onClick={() =>
                          updateFeature(
                            feature.name,
                            feature.enabled
                          )
                        }
                        disabled={updating === feature.name}
                        className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                          feature.enabled
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        } ${
                          updating === feature.name
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:scale-[1.02]"
                        }`}
                      >
                        {updating === feature.name ? (
                          <span className="flex items-center justify-center gap-2">
                            <FiLoader className="animate-spin" />
                            Updating...
                          </span>
                        ) : feature.enabled ? (
                          "Disable Feature"
                        ) : (
                          "Enable Feature"
                        )}
                      </button>
                    </div>

                    {/* Bottom Glow */}
                    <div
                      className={`h-1 w-full ${
                        feature.enabled
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
}

export default FeatureToggle;
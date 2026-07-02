import React, { useEffect, useState, useContext } from "react";
import { getSettings, updateSettings } from "../api/apiCall";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Save, Globe, Share2, Image as ImageIcon, Sparkles, Hash, Calendar, MapPin, Layers, Users, Info, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Settings() {
  const navigate = useNavigate();
  const { currentFestival, setCurrentFestival } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form settings state
  const [settings, setSettings] = useState({
    date: "",
    venue: "",
    description: "",
    badge: "",
    title: "",
    edition: "",
    programsCount: "",
    participantsCount: "",
    instagram: "",
    whatsapp: "",
    facebook: "",
    youtube: "",
    footerText: "",
    mapLink: "",
    externalApiEnabled: false,
    externalApiKey: "",
    externalBaseUrl: ""
  });

  // Preview and file state
  const [bannerPreview, setBannerPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [rightFile, setRightFile] = useState(null);

  useEffect(() => {
    async function fetchSettingsData() {
      try {
        setLoading(true);
        const res = await getSettings();
        if (res.success && res.settings) {
          const s = res.settings;
          setSettings({
            date: s.date || "",
            venue: s.venue || "",
            description: s.description || "",
            badge: s.badge || "",
            title: s.title || "",
            edition: s.edition || "",
            programsCount: s.programsCount || "",
            participantsCount: s.participantsCount || "",
            instagram: s.instagram || "",
            whatsapp: s.whatsapp || "",
            facebook: s.facebook || "",
            youtube: s.youtube || "",
            footerText: s.footerText || "",
            mapLink: s.mapLink || "",
            externalApiEnabled: res.externalApiEnabled || false,
            externalApiKey: res.externalApiKey || "",
            externalBaseUrl: res.externalBaseUrl || ""
          });
          setBannerPreview(s.bannerImage || "");
          setRightPreview(s.rightImage || "");
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
        toast.error("Failed to load settings data");
      } finally {
        setLoading(false);
      }
    }
    fetchSettingsData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "banner") {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
      } else {
        setRightFile(file);
        setRightPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    Object.entries(settings).forEach(([key, val]) => {
      formData.append(key, val);
    });

    if (bannerFile) formData.append("bannerImage", bannerFile);
    if (rightFile) formData.append("rightImage", rightFile);

    try {
      const res = await updateSettings(formData);
      if (res.success) {
        toast.success("Settings updated successfully! ✅");
        if (res.settings) {
          setBannerPreview(res.settings.bannerImage || "");
          setRightPreview(res.settings.rightImage || "");
          setBannerFile(null);
          setRightFile(null);
        }
        
        // Update context and local state
        setCurrentFestival(prev => ({
          ...prev,
          externalApiEnabled: res.externalApiEnabled,
          externalApiKey: res.externalApiKey,
          externalBaseUrl: res.externalBaseUrl
        }));
        setSettings(prev => ({
          ...prev,
          externalApiEnabled: res.externalApiEnabled || false,
          externalApiKey: res.externalApiKey || "",
          externalBaseUrl: res.externalBaseUrl || ""
        }));
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings. ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-400 font-semibold animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col py-12 relative overflow-hidden px-4 md:px-8">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full shadow-lg border border-gray-700 transition z-20 flex items-center justify-center"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="container max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 mt-6 md:mt-0">
          <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-2 block">
            Portal Customization
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            Homepage & Social Settings
          </h2>
          <p className="text-gray-400 text-sm">
            Customize branding, text details, and social media links for your festival homepage.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Homepage Text details */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-700 pb-4 mb-6">
              <div className="p-2.5 bg-indigo-900/50 rounded-xl text-indigo-400">
                <Globe size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Homepage Content Settings</h3>
                <p className="text-xs text-gray-400">Customize the headers, description, date, and venue details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-400" /> Sparkle Badge / Sector text
                </label>
                <input
                  type="text"
                  name="badge"
                  placeholder="e.g. SSF KUTTIKKATOOR"
                  value={settings.badge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Hash size={14} className="text-indigo-400" /> Title Header
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Sahityotsav"
                  value={settings.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Hash size={14} className="text-indigo-400" /> Year / Edition Title
                </label>
                <input
                  type="text"
                  name="edition"
                  placeholder="e.g. 26"
                  value={settings.edition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-400" /> Date String
                </label>
                <input
                  type="text"
                  name="date"
                  placeholder="e.g. May 22 & 23, 2026"
                  value={settings.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-400" /> Venue String
                </label>
                <input
                  type="text"
                  name="venue"
                  placeholder="e.g. Kuttippadam"
                  value={settings.venue}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-400" /> Google Maps Embed URL
                </label>
                <input
                  type="text"
                  name="mapLink"
                  placeholder="e.g. https://www.google.com/maps/embed?pb=..."
                  value={settings.mapLink || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition mb-3"
                />
                <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  Go to Google Maps &rarr; Search your location &rarr; Click Share &rarr; Select "Embed a map" tab &rarr; copy the URL inside the <strong>src</strong> attribute of the generated iframe code.
                </p>
                {settings.mapLink && (
                  <div className="w-full h-[250px] rounded-2xl overflow-hidden border border-gray-700 bg-gray-900 relative">
                    <iframe
                      src={settings.mapLink}
                      title="Google Maps Location Preview"
                      className="w-full h-full border-0 grayscale-[20%] contrast-125"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-400" /> Programs Count
                  </label>
                  <input
                    type="text"
                    name="programsCount"
                    placeholder="e.g. 140+"
                    value={settings.programsCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-400" /> Participants Count
                  </label>
                  <input
                    type="text"
                    name="participantsCount"
                    placeholder="e.g. 300+"
                    value={settings.participantsCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Info size={14} className="text-indigo-400" /> Subtitle Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Introduce the event, its scope, and context..."
                  value={settings.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Branding Media */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-700 pb-4 mb-6">
              <div className="p-2.5 bg-indigo-900/50 rounded-xl text-indigo-400">
                <ImageIcon size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Homepage Branding Media</h3>
                <p className="text-xs text-gray-400">Upload background and sidebar images for a professional aesthetic.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Banner Image */}
              <div className="flex flex-col space-y-3">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                  Main Homepage Banner Background
                </label>
                <div
                  onClick={() => document.getElementById("bannerImageInput").click()}
                  className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-gray-600 hover:border-indigo-500 bg-gray-900 hover:bg-gray-700/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
                >
                  {bannerPreview ? (
                    <>
                      <img
                        src={bannerPreview}
                        alt="Banner Background"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-semibold flex items-center gap-2">
                          Change Banner Image
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors p-4">
                      <ImageIcon size={42} className="mb-2 opacity-55" />
                      <p className="font-semibold text-sm text-center">Click to upload banner background</p>
                      <p className="text-[10px] text-gray-500 mt-1">Recommended size: 1920x1080</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="bannerImageInput"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "banner")}
                />
              </div>

              {/* Right Side Visual Image */}
              <div className="flex flex-col space-y-3">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                  Right Sidebar Visual Card
                </label>
                <div
                  onClick={() => document.getElementById("rightImageInput").click()}
                  className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-gray-600 hover:border-indigo-500 bg-gray-900 hover:bg-gray-700/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
                >
                  {rightPreview ? (
                    <>
                      <img
                        src={rightPreview}
                        alt="Sidebar Visual"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-semibold flex items-center gap-2">
                          Change Sidebar Image
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors p-4">
                      <ImageIcon size={42} className="mb-2 opacity-55" />
                      <p className="font-semibold text-sm text-center">Click to upload sidebar card visual</p>
                      <p className="text-[10px] text-gray-500 mt-1">Recommended size: 450x550 (portrait)</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="rightImageInput"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "right")}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social & Footer Links */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-700 pb-4 mb-6">
              <div className="p-2.5 bg-indigo-900/50 rounded-xl text-indigo-400">
                <Share2 size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Social Media & Footer Integration</h3>
                <p className="text-xs text-gray-400">Configure links to social accounts. Hiding happens automatically if links are blank.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Instagram Page Link
                </label>
                <input
                  type="url"
                  name="instagram"
                  placeholder="https://instagram.com/..."
                  value={settings.instagram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  WhatsApp Group / Chat Link
                </label>
                <input
                  type="url"
                  name="whatsapp"
                  placeholder="https://chat.whatsapp.com/..."
                  value={settings.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Facebook Page Link
                </label>
                <input
                  type="url"
                  name="facebook"
                  placeholder="https://facebook.com/..."
                  value={settings.facebook}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  YouTube Channel Link
                </label>
                <input
                  type="url"
                  name="youtube"
                  placeholder="https://youtube.com/..."
                  value={settings.youtube}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Footer Title / Sector Description
                </label>
                <input
                  type="text"
                  name="footerText"
                  placeholder="e.g. Kozhikode Sector"
                  value={settings.footerText}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4: External API Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-700 pb-4 mb-6">
              <div className="p-2.5 bg-indigo-900/50 rounded-xl text-indigo-400">
                <Key size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">External API Integration</h3>
                <p className="text-xs text-gray-400">Fetch event results and team standings dynamically from an external API service.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-2xl">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-bold text-white">Enable External API Integration</span>
                  <span className="text-xs text-gray-400">
                    If active, public results and team standings will be loaded from the configured external base URL using the provided API key. Manual entries on this portal will be disabled.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.externalApiEnabled}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, externalApiEnabled: e.target.checked }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-650"></div>
                </label>
              </div>

              {settings.externalApiEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-2xl animate-fadeIn">
                  <div>
                    <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2">
                      External API Base URL
                    </label>
                    <input
                      type="text"
                      name="externalBaseUrl"
                      placeholder="e.g. https://demo.sahityotsav.com/api"
                      value={settings.externalBaseUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                      required={settings.externalApiEnabled}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2">
                      External API Key
                    </label>
                    <input
                      type="text"
                      name="externalApiKey"
                      placeholder="Enter the 64-char API key"
                      value={settings.externalApiKey}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                      required={settings.externalApiEnabled}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center justify-center gap-2 py-4 px-12 rounded-xl font-bold text-lg transition-all shadow-lg w-full md:w-auto ${
                saving
                  ? "bg-indigo-800 text-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-[1.02]"
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Portal Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default Settings;

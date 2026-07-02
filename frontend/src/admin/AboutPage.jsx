import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSettings, getDescription, getFullEventTitle } from '../api/apiCall';

const AboutPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [themeDesc, setThemeDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, descRes] = await Promise.all([
          getSettings(),
          getDescription()
        ]);
        if (settingsRes?.success && settingsRes?.settings) {
          setSettings(settingsRes.settings);
          document.title = `About - ${getFullEventTitle(settingsRes.settings)}`;
        }
        if (descRes?.data) {
          setThemeDesc(descRes.data);
        }
      } catch (err) {
        console.error("Error fetching about page details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEditionText = (edition) => {
    if (!edition) return "32nd";
    if (/[0-9]+(st|nd|rd|th)$/i.test(edition)) return edition;
    const num = parseInt(edition);
    if (isNaN(num)) return edition;
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return edition + "st";
    if (j === 2 && k !== 12) return edition + "nd";
    if (j === 3 && k !== 13) return edition + "rd";
    return edition + "th";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-500 font-semibold animate-pulse">Loading About Page...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-green-50  py-12 px-6 md:px-16 text-gray-800 font-sans relative min-h-screen">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center border border-gray-100"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-4 tracking-tight">
            {getEditionText(settings?.edition)} Edition {settings?.badge || "SSF Sector"} {settings?.title || "Sahityotsav"}
          </h1>
          <p className="text-xl text-gray-600 italic">
            Celebrating Artistic Excellence
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-gray-100/50">
          <p className="text-lg leading-relaxed text-gray-700">
            {settings?.description || (
              <>
                The <span className="font-semibold text-green-600">Sunni Students' Federation (SSF)</span> is proud to present the 33rd edition of the <strong>Sector Sahityotsav</strong>, a premier cultural and artistic extravaganza that has been a cornerstone of creative expression for students across India. For five decades, this esteemed event has provided a platform for young talent to shine, showcasing their skills in various art forms and literary pursuits.
              </>
            )}
          </p>
        </section>

        {/* About SSF */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-gray-100/50">
          <h2 className="text-2xl font-bold text-green-700 mb-4">About SSF</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            The <strong>Sunni Students' Federation (SSF)</strong> is a national student organization dedicated to nurturing and promoting the intellectual, cultural, and artistic talents of students. With a presence in every state, SSF has been a driving force in shaping the minds of young individuals, empowering them to become leaders and change-makers. Through various programs and events, SSF fosters a culture of creativity, innovation, and excellence among students.
          </p>
        </section>

        {/* About the Event */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-gray-100/50">
          <h2 className="text-2xl font-bold text-green-700 mb-4">About the Event</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            The <strong>Sahityotsav</strong> is a celebration of creativity and talent, featuring around <strong>{settings?.programsCount || "180"} competitions</strong> in art and literature that cater to diverse interests and abilities. With over <strong>{settings?.participantsCount || "300+"} participants</strong>, from unit level to the Sector/District level, the event encourages students to express themselves, explore their creativity, and strive for excellence. Competitions range from poetry and storytelling to painting, performance, and more.
          </p>
        </section>

        {/* Theme */}
        <section className="bg-green-100/60 border-l-8 border-green-600 shadow-md rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Theme: {themeDesc ? "Concept & Theme" : "The Importance of Humanity in Contemporary Scenario"}
          </h2>
          <p className="text-lg leading-relaxed text-green-900 whitespace-pre-line">
            {themeDesc || "This year's Sahityotsav theme highlights the significance of humanity in today’s world — where conflicts, crises, and challenges call for empathy, compassion, and creative solutions. Participants are invited to reflect on the role of humanity through their art, literature, and performances, bringing light to a world in need of kindness."}
          </p>
        </section>

        {/* Closing Section */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-gray-100/50">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Empowering Young Minds</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            The <strong>{settings?.badge || "SSF KUTTIKKATOOR"} Sahityotsav</strong> is more than just a cultural event — it’s a celebration of the immense artistic potential within young minds. By offering this prestigious platform, we aim to nurture the <span className="text-green-600 font-medium">intellectual, cultural, and creative growth</span> of students, helping shape the leaders of tomorrow.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

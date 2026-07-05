import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  Download,
  FileText,
  User,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Calendar,
  MapPin,
  Inbox,
  Flame,
  KeyRound,
  LogOut
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function StudentDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Login Form States
  const [chestNumberInput, setChestNumberInput] = useState("");
  const [dobInput, setDobInput] = useState("");

  // Pre-fill chest number from navigation state if redirected from homepage
  useEffect(() => {
    if (location.state?.chestNumber) {
      setChestNumberInput(location.state.chestNumber);
    }
  }, [location]);

  // App States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [certificateBg, setCertificateBg] = useState("/Certificate.webp");
  const [loadingBg, setLoadingBg] = useState(false);

  // Dynamic Client-side rendering of PDF background using Mozilla PDF.js via CDN
  useEffect(() => {
    if (selectedCertificate) {
      setLoadingBg(true);

      const loadPdfJs = () => {
        return new Promise((resolve, reject) => {
          if (window.pdfjsLib) {
            resolve(window.pdfjsLib);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
            resolve(window.pdfjsLib);
          };
          script.onerror = () => reject(new Error("Failed to load PDF library."));
          document.head.appendChild(script);
        });
      };

      const convertPdfToImage = async (pdfUrl) => {
        const pdfjsLib = await loadPdfJs();
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Dynamically compute the required scale to render the PDF page at exactly 2048px width
        const viewportOriginal = page.getViewport({ scale: 1.0 });
        const targetScale = 2048 / viewportOriginal.width;
        const viewport = page.getViewport({ scale: targetScale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        return canvas.toDataURL("image/jpeg", 1.0);
      };

      convertPdfToImage("/Certificate.pdf")
        .then((dataUrl) => {
          setCertificateBg(dataUrl);
          setLoadingBg(false);
        })
        .catch((err) => {
          console.warn("Could not load PDF template background, falling back to JPG:", err);
          setCertificateBg("/Certificate.webp");
          setLoadingBg(false);
        });
    }
  }, [selectedCertificate]);

  // Auto-update preview scale based on screen size (fits both width and height dynamically)
  useEffect(() => {
    if (selectedCertificate) {
      const updateScale = () => {
        const paddingWidth = 48; // Left/Right margins
        const paddingHeight = 220; // Header, padding, margins, and action buttons combined height overhead

        const scaleWidth = (window.innerWidth - paddingWidth) / 2048;
        const scaleHeight = (window.innerHeight - paddingHeight) / 1448;

        // Fit both dimensions cleanly
        const finalScale = Math.min(scaleWidth, scaleHeight);

        // Cap the maximum scaling factor to 0.95 for design cleanliness
        setPreviewScale(Math.min(0.95, finalScale));
      };
      updateScale();
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }
  }, [selectedCertificate]);

  const handlePdfDownload = async (fullName, competitionName) => {
    setDownloadingId(competitionName);
    try {
      // Step 1: Explicitly activate Sora font for canvas (document.fonts.ready is NOT enough —
      // we must call load() with the exact weight/size to guarantee it's usable in canvas 2D context)
      const fontSpec400 = `400 35px Sora`;
      const fontSpec600 = `600 35px Sora`;
      const fontLoads = await Promise.allSettled([
        document.fonts.load(fontSpec400),
        document.fonts.load(fontSpec600),
      ]);
      // Determine which font family to use — fall back to Georgia if Sora failed to load
      const fontFamily = fontLoads.some(r => r.status === "fulfilled" && r.value.length > 0)
        ? "Sora, Georgia, serif"
        : "Georgia, serif";

      // Step 2: Load Certificate.webp as an Image (same origin — no CORS needed)
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load Certificate.webp from /Certificate.webp"));
        image.src = "/Certificate.webp";
      });

      // Step 3: Draw the certificate template on canvas at its native resolution
      const canvas = document.createElement("canvas");
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Step 4: Draw text overlay with textBaseline = "top" so y matches CSS `top` values
      ctx.textBaseline = "top";

      const normalizedRank = (() => {
        const n = String(selectedCertificate.rank).toLowerCase().trim();
        if (n === "1" || n === "first" || n.startsWith("1st")) return "First";
        if (n === "2" || n === "second" || n.startsWith("2nd")) return "Second";
        if (n === "3" || n === "third" || n.startsWith("3rd")) return "Third";
        return String(selectedCertificate.rank).toUpperCase();
      })();

      // Scale coordinates proportionally in case WebP size differs from 2048×1448 reference
      const refW = 2048, refH = 1448;
      const sx = W / refW;
      const sy = H / refH;

      const textX = Math.round(174 * sx);
      const textY = Math.round(819 * sy);
      const baseFontSize = Math.round(36 * sx);
      const maxLineWidth = Math.round(1126 * sx); // max width of text area (scaled)
      const lineHeight = Math.round(baseFontSize * 1.65);

      // Measure total width of a line at a given fontSize
      const measureLine = (segments, size) => {
        return segments.reduce((total, seg) => {
          ctx.font = `${seg.bold ? "600" : "400"} ${size}px ${fontFamily}`;
          return total + ctx.measureText(seg.text).width;
        }, 0);
      };

      // Word-wrap mixed bold/regular segments within maxLineWidth
      // Returns array of lines, each line being array of { text, bold } tokens
      const wrapMixedSegments = (segments, maxW) => {
        const wrappedLines = [[]];
        let lineWidth = 0;

        for (const seg of segments) {
          // Split on spaces but keep the space as part of the next token prefix
          const words = seg.text.split(/(?<=\s)|(?=\s)/);
          for (const word of words) {
            if (!word) continue;
            ctx.font = `${seg.bold ? "600" : "400"} ${baseFontSize}px ${fontFamily}`;
            const wordWidth = ctx.measureText(word).width;
            const lastLine = wrappedLines[wrappedLines.length - 1];
            const isWhitespace = /^\s+$/.test(word);

            if (lineWidth + wordWidth <= maxW || lastLine.length === 0) {
              lastLine.push({ text: word, bold: seg.bold });
              lineWidth += wordWidth;
            } else if (isWhitespace) {
              // Trailing whitespace that caused overflow: start new line, discard space
              wrappedLines.push([]);
              lineWidth = 0;
            } else {
              // Real word that overflows: wrap to new line
              wrappedLines.push([{ text: word, bold: seg.bold }]);
              lineWidth = wordWidth;
            }
          }
        }

        return wrappedLines.filter(line => line.length > 0);
      };

      // Draw wrapped segments; returns number of lines rendered (used to advance y)
      const drawMixedLine = (segments, x, y) => {
        const lines = wrapMixedSegments(segments, maxLineWidth);
        for (let i = 0; i < lines.length; i++) {
          let currentX = x;
          for (const token of lines[i]) {
            ctx.font = `${token.bold ? "600" : "400"} ${baseFontSize}px ${fontFamily}`;
            ctx.fillStyle = token.bold ? "#0f172a" : "#2c2c2c";
            ctx.fillText(token.text, currentX, y + i * lineHeight);
            currentX += ctx.measureText(token.text).width;
          }
        }
        return lines.length;
      };

      // Draw each paragraph block; y advances by the number of wrapped lines rendered
      let currentY = textY;
      currentY += drawMixedLine([
        { text: "This is to certify that Mr.\u00a0", bold: false },
        { text: fullName, bold: true },
        { text: "\u00a0secured\u00a0", bold: false },
        { text: normalizedRank, bold: true },
      ], textX, currentY) * lineHeight;

      currentY += drawMixedLine([
        { text: "Prize in the\u00a0", bold: false },
        { text: competitionName, bold: true },
        { text: "\u00a0Competition with\u00a0", bold: false },
        { text: selectedCertificate.grade, bold: true },
        { text: "\u00a0Grade at the 33rd Edition of the Kozhikode South District Sahityotsav, held at Poonoor from 1 to 5 July 2026.", bold: false },
      ], textX, currentY) * lineHeight;





      // Step 5: Export as high-quality JPEG and embed into A4 landscape PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.96);
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      pdf.addImage(imgData, "JPEG", 0, 0, 841.89, 595.28, undefined, "FAST");
      pdf.save(`Certificate_${fullName.replace(/\s+/g, "_")}_${competitionName.replace(/\s+/g, "_")}.pdf`);
      toast.success("Certificate downloaded successfully! 🏆");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Auto-format DOB input (DD-MM-YYYY)
  const handleDobChange = (e) => {
    let value = e.target.value;
    const clean = value.replace(/[^0-9]/g, "");
    let formatted = "";

    if (clean.length > 0) {
      formatted += clean.substring(0, 2);
    }
    if (clean.length > 2) {
      formatted += "-" + clean.substring(2, 4);
    }
    if (clean.length > 4) {
      formatted += "-" + clean.substring(4, 8);
    }

    setDobInput(formatted);
  };

  // Login/Fetch Participant Data
  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!chestNumberInput.trim() || !dobInput.trim()) {
      setError("Please fill in both chest number and date of birth.");
      return;
    }

    const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dobRegex.test(dobInput.trim())) {
      setError("Enter Date of Birth in DD-MM-YYYY format.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/external-participant-details", {
        params: {
          chestNumber: chestNumberInput.trim(),
          dob: dobInput.trim()
        }
      });

      if (response.data && response.data.data) {
        console.log(response.data)
        setData(response.data.data);
        setIsLoggedIn(true);
        // Store in sessionStorage so page reload preserves state during active session
        sessionStorage.setItem("student_chest", chestNumberInput.trim());
        sessionStorage.setItem("student_dob", dobInput.trim());
      } else {
        setError("Invalid response received from server.");
      }
    } catch (err) {
      console.error("Fetch Student Data Error:", err);
      const msg = err.response?.data?.msg || err.response?.data?.message;
      if (msg) {
        setError(msg);
      } else if (err.response?.status === 404) {
        setError("No participant records found with that chest number and date of birth.");
      } else if (err.response?.status === 400) {
        setError("Participant details lookup is not enabled or parameters invalid.");
      } else {
        setError("Network error. Please verify your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Restore session if exists
  useEffect(() => {
    const savedChest = sessionStorage.getItem("student_chest");
    const savedDob = sessionStorage.getItem("student_dob");
    if (savedChest && savedDob) {
      setChestNumberInput(savedChest);
      setDobInput(savedDob);
      // Auto fetch
      setLoading(true);
      axios.get("/external-participant-details", {
        params: {
          chestNumber: savedChest,
          dob: savedDob
        }
      }).then(response => {
        if (response.data && response.data.data) {
          setData(response.data.data);
          setIsLoggedIn(true);
        }
      }).catch(err => {
        console.error("Auto restore session failed", err);
        sessionStorage.removeItem("student_chest");
        sessionStorage.removeItem("student_dob");
      }).finally(() => {
        setLoading(false);
      });
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setData(null);
    setChestNumberInput("");
    setDobInput("");
    sessionStorage.removeItem("student_chest");
    sessionStorage.removeItem("student_dob");
    toast.success("Logged out successfully.");
  };

  // Certificate Download Handler
  const handleDownloadCertificate = async (competitionId, participantId) => {
    setDownloadingId(competitionId);
    try {
      const primaryUrl = `/certificates/${competitionId}/${participantId}.pdf`;
      const fallbackUrl = `/certificates/${competitionId}/${chestNumberInput.trim()}.pdf`;

      let response = await fetch(primaryUrl);
      if (!response.ok) {
        response = await fetch(fallbackUrl);
      }

      if (!response.ok) {
        throw new Error("Certificate PDF file is not available on the server yet.");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `certificate_${chestNumberInput.trim()}_${competitionId}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Certificate downloaded successfully! 🎉");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to download certificate.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[90px] pointer-events-none z-0"></div>

      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-45 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all flex items-center justify-center active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Student Portal
        </span>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="p-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-xl border border-red-900/30 transition-all flex items-center justify-center active:scale-95"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        ) : (
          <div className="w-10"></div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 relative z-10">

        {loading && !isLoggedIn ? (
          // Loading spinner during login/auto-auth
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <p className="text-xs text-slate-400 mt-4 font-medium animate-pulse">Authenticating credentials...</p>
          </div>
        ) : !isLoggedIn ? (

          /* 1. LOGIN CARD (Chest Number & DOB) */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md"
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 text-indigo-400">
              <KeyRound size={24} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-100 mb-1">Participant Login</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Please enter your Chest Number and Date of Birth to access outcomes, marks, and prize certificates.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Chest Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Chest Number
                </label>
                <div className="relative">
                  <Flame className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-400" />
                  <input
                    type="text"
                    value={chestNumberInput}
                    onChange={(e) => setChestNumberInput(e.target.value)}
                    placeholder="e.g. A001"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono uppercase tracking-wider font-semibold"
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-400" />
                  <input
                    type="text"
                    value={dobInput}
                    onChange={handleDobChange}
                    maxLength={10}
                    placeholder="DD-MM-YYYY"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/30 p-3.5 rounded-2xl text-center leading-normal">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Access Desk</span>
                )}
              </button>

            </form>
          </motion.div>

        ) : data ? (

          /* 2. DYNAMIC PROFILE PAGE (Authenticated) */
          <div className="space-y-6">

            {/* Student Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden group backdrop-blur-sm"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-2.5 bg-slate-800 rounded-full mb-6 border border-slate-700/60 shadow-inner"></div>

                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl flex items-center justify-center overflow-hidden bg-slate-950">
                    {data.participant.photo ? (
                      <img
                        src={data.participant.photo}
                        alt={data.participant.fullName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-slate-400">
                        <User size={38} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1.5 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-full border border-indigo-400/40 shadow flex items-center gap-0.5">
                    <Sparkles size={10} className="text-yellow-400" />
                    <span>{data.participant.category}</span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-indigo-400 mb-3 shadow-inner">
                  <Flame size={12} className="text-orange-500" />
                  <span>CHEST NO. {data.participant.chestNumber}</span>
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 mb-1">
                  {data.participant.fullName}
                </h2>

                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-5 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>{data.participant.gender || "Participant"}</span>
                </div>

                <div className="w-full border-t border-slate-900/80 pt-4 mt-2 grid grid-cols-2 gap-4 text-left text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Team Identity</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <MapPin size={12} className="text-indigo-400" />
                      <span className="truncate">{data.participant.teamName}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Event details</span>
                    <span className="font-bold text-slate-200 block truncate">
                      {data.participant.eventName || "Sahityotsav 2026"}
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Total - Blue */}
              <div className="bg-slate-900/50 border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-400/80 block">Total</span>
                <span className="text-3xl font-black font-mono text-blue-400 mt-2 block">{data.competitionOverview.totalCompetitions}</span>
              </div>

              {/* Completed - Green */}
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400/80 block">Completed</span>
                <span className="text-3xl font-black font-mono text-emerald-400 mt-2 block">{data.competitionOverview.completedCompetitions}</span>
              </div>

              {/* Prizes Won - Purple */}
              <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl"></div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400/80 block">Prizes Won</span>
                <span className="text-3xl font-black font-mono text-purple-400 mt-2 block">{data.competitionOverview.prizesWon}</span>
              </div>

              {/* Pending Collection - Yellow */}
              <div className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400/80 block">Pending Collection</span>
                <span className="text-3xl font-black font-mono text-amber-400 mt-2 block">{data.competitionOverview.prizesPendingCollection}</span>
              </div>
            </div>

            {/* Competition Card list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Registered Competitions</span>
                <span className="text-xs font-mono text-indigo-400 font-bold">({data.competitions.length} Items)</span>
              </div>

              {data.competitions.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                  <Inbox className="w-12 h-12 text-slate-600 mb-3" />
                  <h4 className="text-sm font-bold text-slate-300">No Registrations</h4>
                </div>
              ) : (
                data.competitions.map((comp, index) => {
                  const isPublished = comp.resultPublished === true || comp.result?.published === true || comp.result?.published === "true";
                  const rank = comp.result?.rank || comp.result?.position || comp.result?.postion;
                  const grade = comp.result?.grade;
                  const point = comp.result?.point !== undefined ? comp.result.point : comp.result?.points;
                  const isQualified = comp.result?.isQualified === true || comp.result?.qualified === true || comp.result?.qualified === "true";
                  const hasPrize = comp.prize?.exists === true || !!comp.prize?.title;
                  const isCollected = comp.prize?.isCollected === true;
                  const prizeTitle = comp.prize?.title || "Prize";

                  return (
                    <motion.div
                      key={comp.competitionId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`rounded-2xl border p-5 transition-all shadow-md relative overflow-hidden ${isPublished
                        ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                        : "bg-slate-900/25 border-slate-900/60 text-slate-400"
                        }`}
                    >
                      <h4 className="text-base font-extrabold text-slate-200 mb-3">{comp.competitionName}</h4>

                      {isPublished ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2.5">
                            {rank && (
                              <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm text-xs font-bold text-indigo-400">
                                <span className="text-[10px] text-slate-500 uppercase">Rank</span>
                                <span className="uppercase">
                                  {(() => {
                                    const normalized = String(rank).toLowerCase().trim();
                                    if (normalized === "1" || normalized === "first" || normalized.startsWith("1st")) return "1st Place";
                                    if (normalized === "2" || normalized === "second" || normalized.startsWith("2nd")) return "2nd Place";
                                    if (normalized === "3" || normalized === "third" || normalized.startsWith("3rd")) return "3rd Place";
                                    return `#${rank}`;
                                  })()}
                                </span>
                              </div>
                            )}
                            {grade && (
                              <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm text-xs font-bold text-purple-400 font-mono">
                                <span className="text-[10px] text-slate-500 uppercase">Grade</span>
                                <span>{grade}</span>
                              </div>
                            )}
                            {point !== undefined && (
                              <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm text-xs font-bold text-amber-500">
                                <span className="text-[10px] text-slate-500 uppercase">Points</span>
                                <span>{point} Pts</span>
                              </div>
                            )}
                            <div className={`px-3 py-1 rounded-xl flex items-center gap-1.5 border text-xs font-bold shadow-sm ${isQualified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isQualified ? "bg-emerald-400" : "bg-red-400"}`}></span>
                              <span>{isQualified ? "Qualified" : "Not Qualified"}</span>
                            </div>
                          </div>

                          {/* Prize and Download Certificate */}
                          {hasPrize && (
                            <div className="border-t border-slate-850/60 pt-3 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/20 p-3 rounded-xl border border-slate-900">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🥇</span>
                                <div>
                                  <span className="text-xs font-bold text-slate-200 block">{prizeTitle}</span>
                                  <span className={`text-[10px] font-semibold mt-0.5 block ${isCollected ? "text-emerald-400" : "text-amber-400"}`}>
                                    {isCollected ? "🟢 Collected" : "🟡 Pending Collection"}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedCertificate({
                                  fullName: data.participant.fullName,
                                  rank: rank,
                                  competitionName: comp.competitionName,
                                  grade: grade || "N/A"
                                })}
                                className="px-4 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                              >
                                <FileText size={14} />
                                <span>Open Certificate</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-950/40 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
                          <Clock className="w-5 h-5 text-slate-500" />
                          <div>
                            <span className="text-xs font-bold text-slate-400 block">Result Not Published Yet</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

          </div>
        ) : null}

      </main>

      {/* Certificate Modal Overlay */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto"
          >
            {/* Modal Card wrapper */}
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center gap-6 shadow-2xl relative">

              {/* Close Button */}
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-lg font-bold text-slate-100 mt-2">Certificate of Merit</h3>

              {/* Certificate Scaled Area */}
              <div
                className="overflow-hidden flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-850 relative"
                style={{
                  width: `${2048 * previewScale}px`,
                  height: `${1448 * previewScale}px`
                }}
              >

                {loadingBg && (
                  <div className="absolute inset-0 z-20 bg-slate-950/75 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-medium">Loading high-res PDF template...</span>
                  </div>
                )}

                {/* Certificate Container with fixed size for printing */}
                <div
                  id="certificate-print-area"
                  className="w-[2048px] h-[1448px] relative bg-white overflow-hidden shadow-lg select-none shrink-0"
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "center center",
                    backgroundImage: `url('${certificateBg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {/* Certificate Content */}
                  <div className="absolute left-[174px] top-[819px] z-10 w-[1100px] text-[#2c2c2c]">
                    <p
                      className="text-[35px] font-regular leading-relaxed font-sans"
                      style={{
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      This is to certify that Mr.&nbsp;
                      <span className="inline-block px-1 font-semibold text-slate-900">
                        {selectedCertificate.fullName}
                      </span>
                      &nbsp;secured&nbsp;
                      <span className="inline-block px-1 font-semibold text-slate-900">
                        {(() => {
                          const normalized = String(selectedCertificate.rank).toLowerCase().trim();
                          if (normalized === "1" || normalized === "first" || normalized.startsWith("1st")) return "First";
                          if (normalized === "2" || normalized === "second" || normalized.startsWith("2nd")) return "Second";
                          if (normalized === "3" || normalized === "third" || normalized.startsWith("3rd")) return "Third";
                          return String(selectedCertificate.rank).toUpperCase();
                        })()}
                      </span>
                      <br />
                      Prize in the&nbsp;
                      <span className="inline-block px-1 font-semibold text-slate-900">
                        {selectedCertificate.competitionName}
                      </span>
                      &nbsp;Competition with&nbsp;
                      <span className="inline-block px-1 font-semibold text-slate-900">
                        {selectedCertificate.grade}
                      </span>
                      &nbsp;Grade at the 33rd Edition of the Kozhikode South District Sahityotsav, held at Poonoor from 1 to 5 July 2026.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={() => handlePdfDownload(selectedCertificate.fullName, selectedCertificate.competitionName)}
                  disabled={downloadingId === selectedCertificate.competitionName}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {downloadingId === selectedCertificate.competitionName ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Compiling PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download as PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                >
                  Close
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

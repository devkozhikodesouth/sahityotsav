import React from 'react';
import { FaInstagram, FaWhatsapp, FaFacebookF, FaYoutube } from 'react-icons/fa';

function Footer({ festival }) {
  const footerText = festival?.settings?.footerText || festival?.name || "Sahityotsav";

  const instagram = festival?.settings?.instagram !== undefined ? festival.settings.instagram : "";
  const whatsapp = festival?.settings?.whatsapp !== undefined ? festival.settings.whatsapp : "https://chat.whatsapp.com/I00R10oTkLNERwrjiLsIym";
  const facebook = festival?.settings?.facebook !== undefined ? festival.settings.facebook : "";
  const youtube = festival?.settings?.youtube !== undefined ? festival.settings.youtube : "";

  return (
    <footer className="bottom-0 left-0 w-full px-5 md:px-10 lg:px-36 bg-secondary flex flex-col items-center justify-center py-10 relative overflow-hidden paper-texture border-t border-accent/30 shadow-vintage">
      {/* Gold Trim Line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-accent"></div>
      
      {/* Decorative Ornaments */}
      <div className="absolute top-2 left-4 w-8 h-8 border-t border-l border-accent/20 pointer-events-none"></div>
      <div className="absolute top-2 right-4 w-8 h-8 border-t border-r border-accent/20 pointer-events-none"></div>

      <h1 className="text-surface font-heading font-black text-sm lg:text-lg tracking-widest text-center uppercase mb-4">
        {footerText}
      </h1>

      <div className="flex gap-6 text-surface text-lg md:text-xl z-10">
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors duration-300"
            aria-label="Instagram Link"
          >
            <FaInstagram />
          </a>
        )}
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors duration-300"
            aria-label="WhatsApp Link"
          >
            <FaWhatsapp />
          </a>
        )}
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors duration-300"
            aria-label="Facebook Link"
          >
            <FaFacebookF />
          </a>
        )}
        {youtube && (
          <a
            href={youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors duration-300"
            aria-label="YouTube Link"
          >
            <FaYoutube />
          </a>
        )}
      </div>

      <div className="divider-vintage-ornamental max-w-xxs mx-auto my-3 text-accent/20"></div>

      <p className="text-[10px] text-surface/40 uppercase tracking-widest font-heading font-semibold">
        &copy; {new Date().getFullYear()} SSF Kozhikode. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;

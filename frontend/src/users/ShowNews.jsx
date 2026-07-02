import React, { useEffect, useState } from "react";
import { get3News } from "../api/apiCall";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";

const ShowNews = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await get3News();
        if (res?.data) {
          setNewsList(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err.message);
      }
    };

    fetchNews();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  if (!newsList || newsList.length === 0) return null;

  return (
    <section id="news" className="w-full py-24 bg-background relative overflow-hidden paper-texture">
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 flex items-center justify-center gap-2">
            <Newspaper className="w-4 h-4" /> Latest Updates
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
            Recent <span className="text-gradient">News</span>
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
          <p className="text-secondary/80 max-w-xl mx-auto font-serif italic text-sm md:text-base">
            Stay informed with the latest announcements and stories from the festival.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {newsList.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-surface rounded-xl overflow-hidden shadow-md border border-accent/30 flex flex-col group h-full transition-all"
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden p-3 bg-surface">
                <div className="absolute inset-3 bg-primary-dark/10 group-hover:bg-transparent transition-colors z-10 duration-500 rounded-lg"></div>
                <img
                  src={item?.image?.path || '/placeholder-news.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg border border-accent/15 transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Content Section */}
              <div className="p-6 pt-2 flex flex-col flex-grow">
                <h3 className="text-xl font-heading font-bold text-primary mb-3 group-hover:text-accent transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-secondary/85 text-sm leading-relaxed mb-6 font-serif line-clamp-3">
                  {item.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-accent/15">
                  <Link 
                    to={`/news/${item._id}/user`}
                    className="inline-flex items-center gap-2 text-primary font-heading font-bold hover:text-accent transition-colors group/link"
                  >
                    Read Article 
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform text-accent" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ShowNews;

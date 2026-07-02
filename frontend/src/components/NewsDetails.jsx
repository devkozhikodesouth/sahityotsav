import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOneNews, getRelatedNews } from "../api/apiCall";
import RelatedNewsCard from "../users/RelatedNewsCard";

const NewsDetails = () => {
  const { id, user } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState(null);

  useEffect(() => {
    if (user !== "user") return;
    const fetchNewsItem = async () => {
      try {
        const res = await getRelatedNews(id);
        if (res?.data) {
          setRelatedNews(res.data);
        }
      } catch (err) {
        console.error("Error fetching related news:", err.message);
      }
    };
    fetchNewsItem();
  }, [id, user]);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const res = await getOneNews(id);
        if (res?.data) {
          setNews(res.data);
        }
      } catch (err) {
        console.error("Error fetching news item:", err.message);
      }
    };

    fetchNewsItem();
  }, [id]);

  useEffect(() => {
    if (news?.title) {
      document.title = news.title;
    }
  }, [news]);

  if (!news) {
    return (
      <div className="min-h-screen bg-background paper-texture flex items-center justify-center p-10">
        <div className="font-heading font-bold text-primary text-xl animate-pulse">Loading news details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background paper-texture py-24 px-4 md:px-8">
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-5xl mx-auto">
        {/* Main Content */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary leading-tight">
            {news.title}
          </h1>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
        </div>

        <div className="manuscript-panel border-vintage p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start shadow-vintage">
          {/* Image */}
          <div className="w-full md:w-1/2 p-3 bg-surface border border-accent/30 rounded-xl shadow-md flex-shrink-0">
            <img
              src={news.image.path}
              alt={news.title}
              className="w-full h-auto rounded-lg border border-accent/15 shadow-sm"
            />
          </div>

          {/* Description */}
          <div className="w-full md:w-1/2 space-y-4">
            <p className="text-secondary/90 font-serif leading-relaxed text-base md:text-lg text-justify whitespace-pre-line">
              {news.description}
            </p>
          </div>
        </div>

        {user === 'user' && relatedNews?.length > 0 && (
          <div className="mt-16 pt-10 border-t border-accent/15">
            <h3 className="text-2xl font-heading font-black text-primary mb-6">
              Related Updates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedNews.map((item, index) => (
                <RelatedNewsCard key={index} news={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetails;

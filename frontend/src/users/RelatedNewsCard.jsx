import React from 'react';
import { Link } from 'react-router-dom';

const RelatedNewsCard = ({ news }) => {
  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-accent/20 hover:shadow-md transition-all group p-2">
      <div className="relative h-40 overflow-hidden rounded-lg bg-surface">
        <div className="absolute inset-0 bg-primary-dark/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
        <img 
          src={news.image.path} 
          alt={news.title} 
          className="w-full h-full object-cover rounded-lg border border-accent/15 transform group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
      </div>
      <div className="p-3">
        <h4 className="font-heading font-bold text-primary text-base truncate group-hover:text-accent transition-colors">
          {news.title}
        </h4>
        <p className="text-xs text-secondary/80 font-serif line-clamp-2 mt-1 mb-3">
          {news.description}
        </p>
        <Link 
          to={`/news/${news._id}/user`}
          className="inline-block text-xs font-heading font-bold text-primary hover:text-accent transition-colors"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
};

export default RelatedNewsCard;

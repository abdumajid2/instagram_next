import React from "react";

const PendingAnimationOfAsideOfHome = () => {
  return (
    <section className="flex flex-col gap-4">
      {[...Array(5)].map((_, i) => (
        <article key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="w-24 h-3 bg-gray-300 rounded mb-2"></div>
            <div className="w-16 h-2 bg-gray-200 rounded"></div>
          </div>
          <div className="w-12 h-5 bg-gray-300 rounded"></div>
        </article>
      ))}
    </section>
  );
};

export default PendingAnimationOfAsideOfHome;

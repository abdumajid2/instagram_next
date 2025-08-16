import React from "react";

const PendingAnimation = () => {
  return (
    <main className="md:w-[50%] min-h-screen flex justify-center items-start bg-white p-10">
      <section className="flex flex-col gap-8 w-full max-w-[600px]">
        <article className="flex flex-col gap-4">
          <div className="h-[350px] w-full rounded-lg bg-gray-200 animate-pulse"></div>
          <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse"></div>
        </article>

        <article className="flex flex-col gap-4">
          <div className="h-[350px] w-full rounded-lg bg-gray-200 animate-pulse"></div>
          <div className="h-6 w-2/3 rounded bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse"></div>
        </article>

        <article className="flex flex-col gap-4">
          <div className="h-[350px] w-full rounded-lg bg-gray-200 animate-pulse"></div>
          <div className="h-6 w-1/2 rounded bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse"></div>
        </article>
      </section>
    </main>
  );
};

export default PendingAnimation;

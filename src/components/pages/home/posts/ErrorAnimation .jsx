import React from "react";
import { FaExclamationCircle } from "react-icons/fa";

const ErrorAnimation = () => {
  return (
    <>
      <div className="error-overlay" />
      <div className="error-container">
        <FaExclamationCircle className="error-icon" />
        <p className="error-text">Произошла ошибка. Попробуйте снова.</p>
      </div>

      <style jsx>{`
        .error-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(5px);
          animation: fadeIn 0.5s ease forwards;
          z-index: 1000;
        }

        .error-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          background: #f44336; /* Красный цвет Instagram style */
          color: white;
          padding: 30px 40px;
          border-radius: 20px;
          box-shadow: 0 8px 20px rgba(244, 67, 54, 0.6);
          text-align: center;
          max-width: 320px;
          width: 90%;
          animation: popIn 0.5s ease forwards;
          z-index: 1001;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 15px;
          animation: pulse 1.5s infinite;
        }

        .error-text {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          user-select: none;
        }

        /* Анимации */

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.75;
          }
        }
      `}</style>
    </>
  );
};

export default ErrorAnimation;

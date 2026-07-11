import React from 'react';
import './glowing-shadow.css';

/**
 * GlowingShadow - A premium container with a CSS Houdini glowing animated border.
 * @param {React.ReactNode} children - The content to be wrapped.
 * @param {string} className - Additional classes for the container.
 */
export function GlowingShadow({ children, className = "" }) {
  return (
    <div className={`glow-container ${className}`} role="button">
      <span className="glow"></span>
      <div className="glow-content">
        {children}
      </div>
    </div>
  );
}

import React from 'react';
import '../styles/LandingPage.css';
import { Link } from 'react-router-dom';


export default function LandingPage() {
  // Hero image shown at the top of the landing page.
  const heroImage = '/hero1.png';

  return (
    <div className="landing-page">
      {/* Hero section with app value proposition and quick navigation actions */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Inspection Management Made Simple</h1>
          <p className="hero-subtitle">
            Manage inspections, reusable checklists, results, comments, and
            photos in one modern web application.
          </p>

          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              Open Dashboard
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src={heroImage}
            alt="Illustration of a digital inspection checklist"
            className="hero-img"
          />
        </div>
      </section>

      {/* Feature overview section describing key capabilities */}
      <section className="landing-section">
        <h2>What this application offers</h2>

        <div className="landing-features">
          <div className="landing-feature-card">
            <h3>Create and manage inspections</h3>
            <p>
              Plan inspections, assign employees, and track progress from
              planned to completed.
            </p>
          </div>

          <div className="landing-feature-card">
            <h3>Reusable checklists</h3>
            <p>
              Create checklists with multiple steps and reuse them for different
              inspection scenarios.
            </p>
          </div>

          <div className="landing-feature-card">
            <h3>Document results</h3>
            <p>
              Record fulfilled, not fulfilled, or N/A results, add comments, and
              upload photos.
            </p>
          </div>
        </div>
      </section>

      {/* Project context section with educational background */}
      <section className="landing-section landing-highlight">
        <h2>Student Project</h2>
        <p>
          This application was developed as part of a DHBW Web Engineering
          project using React, TypeScript, Spring Boot.
        </p>
      </section>
    </div>
  );
}

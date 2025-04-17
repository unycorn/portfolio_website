import { useState } from 'react';
import './App.css';
import davidLibraryPic from '../david_library.jpeg';
import GridBackground from './components/GridBackground';

function App() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <GridBackground />
      <nav className="navbar">
        <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
        <button onClick={() => scrollToSection('projects')} className="nav-link">Projects</button>
        <button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
      </nav>
      <div className="profile">
        <img src={davidLibraryPic} alt="David Harper" className="profile-pic" />
        <h1>David Harper</h1>
        <p>Physics Major | Aspiring Graduate Student</p>
        <div className="links">
          <a href="https://github.com/unycorn" target="_blank" className="link">GitHub</a>
          <a href="https://linkedin.com/sdavidsquark" target="_blank" className="link">LinkedIn</a>
        </div>
      </div>

      <section id="about" className="section">
        <h2>About Me</h2>
        <p>I am a physics major with a passion for quantum mechanics and computational physics.</p>
      </section>

      <section id="projects" className="section">
        <h2>Projects</h2>
        <p>Here are some of my notable projects in physics and programming.</p>
      </section>

      <section id="contact" className="section">
        <h2>Contact</h2>
        <p>Get in touch with me through LinkedIn or GitHub.</p>
      </section>
    </>
  );
}

export default App;

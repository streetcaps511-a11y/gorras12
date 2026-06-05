import React from 'react';
import { BANNER_URL } from '../utils/constants';
import '../styles/HomeHero.css';

const Hero = () => {
  return (
    <section className="gm-hero">
      <div className="gm-hero-bg" style={{ backgroundImage: `url(${BANNER_URL})` }} />
      <div className="gm-hero-fade-top" />
      <div className="gm-hero-fade-bottom" />
      <div className="gm-hero-inner">
        <h1 className="gm-hero-title">Gorras medellín</h1>
        <p className="gm-hero-sub">Estilo premium a tu alcance.</p>
      </div>
    </section>
  );
};

export default Hero;
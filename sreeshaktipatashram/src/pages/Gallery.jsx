// src/pages/Gallery.jsx (new file)
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Instagram, Facebook, Youtube, X } from 'lucide-react'; // Assuming lucide-react for icons

// Define configurable color palette
// src/config/themeConfig.js (new file, but inlined here for response)
const lightPalette = {
  primary: '#f5f5f5', // neutral light
  text: '#333333',
  muted: '#666666',
  border: '#e0e0e0',
  bg: '#ffffff',
  accent: '#c9a77c', // subtle gold
};

const darkPalette = {
  primary: '#1a1a1a', // neutral dark
  text: '#f5f5f5',
  muted: '#999999',
  border: '#333333',
  bg: '#121212',
  accent: '#a88b5e', // muted gold
};

// Social media colors (muted, non-garish)
const socialColors = {
  instagram: { light: '#d4a4b8', dark: '#a07a8e' }, // muted pink
  facebook: { light: '#a4b8d4', dark: '#7a8ea0' }, // muted blue
  youtube: { light: '#d4a4a4', dark: '#a07a7a' }, // muted red
  x: { light: '#b8b8b8', dark: '#8e8e8e' }, // muted gray
};

const Gallery = () => {
  const { isDark } = useOutletContext(); // Get isDark from AppShell
  const theme = isDark ? { ...darkPalette } : { ...lightPalette }; // Use configurable palette
  const [currentSection, setCurrentSection] = useState('instagram');
  const [feeds, setFeeds] = useState({ instagram: [], facebook: [], youtube: [], x: [] });
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0); // For ring rotation

  const sections = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: socialColors.instagram[isDark ? 'dark' : 'light'] },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: socialColors.facebook[isDark ? 'dark' : 'light'] },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: socialColors.youtube[isDark ? 'dark' : 'light'] },
    { id: 'x', name: 'X', icon: X, color: socialColors.x[isDark ? 'dark' : 'light'] },
  ];

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        const [ig, fb, yt, x] = await Promise.all([
          fetch('/api/gallery/instagram').then(res => res.json()),
          fetch('/api/gallery/facebook').then(res => res.json()),
          fetch('/api/gallery/youtube').then(res => res.json()),
          fetch('/api/gallery/x').then(res => res.json()),
        ]);
        setFeeds({ instagram: ig, facebook: fb, youtube: yt, x: x });
      } catch (error) {
        console.error('Error fetching feeds:', error);
      }
      setLoading(false);
    };
    fetchFeeds();
  }, []);

  const handleSectionChange = (sectionId, index) => {
    setCurrentSection(sectionId);
    setRotation(index * 90); // Rotate by 90 degrees per section (quarter ring)
  };

  return (
    <MainLayout theme={theme}>
      <div className={`min-h-screen ${theme.bg} ${theme.text} relative overflow-hidden`}>
        {/* Quarter Annular Ring (large, small hole, top-right pivot) */}
        <div className="fixed top-0 right-0 z-50" style={{ width: '50vw', height: '50vh' }}>
          <svg viewBox="0 0 200 200" className="w-full h-full" style={{ transform: `rotate(-${rotation}deg)`, transition: 'transform 0.5s ease' }}>
            <defs>
              <clipPath id="quarterClip">
                <path d="M0 0 H200 V200 H0 Z" /> {/* Clip to bottom-left quarter, but positioned top-right */}
              </clipPath>
            </defs>
            <g clipPath="url(#quarterClip)" transform="translate(100,100)">
              {sections.map((sec, idx) => (
                <g key={sec.id} transform={`rotate(${idx * 90})`}>
                  <path
                    d="M0 -90 A90 90 0 0 1 90 0 L70 0 A70 70 0 0 0 0 -70 Z" // Annular sector (small inner radius 70, outer 90 for large area)
                    fill={sec.color}
                    stroke={theme.border}
                    strokeWidth="1"
                  />
                  <text
                    x="50"
                    y="-50"
                    fill={theme.text}
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform="rotate(45)" // Center text in sector
                  >
                    {sec.name}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Navigation (optional, or integrate into ring) */}
        <div className="fixed top-4 right-4 z-40 flex gap-2">
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => handleSectionChange(sec.id, idx)}
              className={`p-2 rounded-full ${currentSection === sec.id ? 'bg-accent' : theme.bg} ${theme.border}`}
            >
              <sec.icon size={24} color={theme.text} />
            </button>
          ))}
        </div>

        {/* Feed Display */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <p className={theme.text}>Loading feeds...</p>
          ) : (
            feeds[currentSection].map((item, idx) => (
              <div key={idx} className={`p-4 ${theme.cardBg || theme.bg} ${theme.border} rounded-lg shadow-md`}>
                {item.type === 'image' && <img src={item.media[0]} alt={item.caption} className="w-full h-auto" />}
                {item.type === 'video' && <video src={item.media[0]} controls className="w-full h-auto" />}
                {item.type === 'carousel' && <div>Carousel: {item.media.length} items</div>}
                <p className={theme.text}>{item.caption}</p>
                <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View on {currentSection}</a>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Gallery;
'use client';

import { FC } from 'react';

const GoogleMap: FC = () => {
  // Coordinates for 2QF4+M38, Addis Ababa
  const latitude = 9.081113412055661; // Approximate latitude for Addis Ababa
  const longitude = 36.58269711013271; // Approximate longitude for Addis Ababa
  const location = "2QF4+M38, Addis Ababa, Ethiopia";

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(location)}&center=${latitude},${longitude}&zoom=15`;

  return (
    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="MiNT Location - Addis Ababa"
        aria-label="Google Maps showing MiNT location in Addis Ababa"
      />
    </div>
  );
};

export default GoogleMap; 
import React, { useState } from 'react';
import ParallelAndSerialCard from './ParallelAndSerialCard';
import KZNCard from './KZNCard';

// Główny komponent z kartami
const CardSwitcher = () => {
  // Stan aktywnej karty
  const [activeCard, setActiveCard] = useState(0);

  // Tablica kart, gdzie każda karta zawiera komponent
  const cards = [
    { title: "Szerergowe i równoległe", component: <ParallelAndSerialCard /> },
    { title: "k-z-n", component: <KZNCard /> },
  ];

  return (
    <div className="card-switcher">
      {/* Sekcja przycisków do przełączania kart */}
      <div className="tabs">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => setActiveCard(index)} // Zmieniamy aktywną kartę
            className={activeCard === index ? 'active' : ''}
          >
            {card.title}
          </button>
        ))}
      </div>

      {/* Renderowanie treści wybranej karty */}
      <div className="card-content">
        {cards[activeCard].component}
      </div>
    </div>
  );
};

export default CardSwitcher;
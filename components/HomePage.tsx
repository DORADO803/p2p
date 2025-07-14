import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const createNewRoom = () => {
    const roomId = 'p2p-list-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    navigate(`/room/${roomId}`, { state: { isHost: true } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark text-brand-light p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-brand-primary">P2P</span> {t('appTitle')}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-4">
          {t('appSlogan')}
        </p>
        <p className="text-lg md:text-xl text-slate-300 mb-8">
          {t('appDescription')}
        </p>
        <button
          onClick={createNewRoom}
          className="bg-brand-primary hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg shadow-cyan-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          {t('createListButton')}
        </button>
        <p className="mt-8 text-sm text-slate-500">
          {t('hostWarning')}
        </p>
      </div>
    </div>
  );
};

export default HomePage;

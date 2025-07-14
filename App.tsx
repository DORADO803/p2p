import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PeerProvider } from './context/PeerContext';
import { LanguageProvider } from './context/LanguageContext';
import HomePage from './components/HomePage';
import RoomPage from './components/RoomPage';
import { LanguageSelector } from './components/LanguageSelector';

function App() {
  return (
    <HashRouter>
      <LanguageProvider>
        <PeerProvider>
          <LanguageSelector />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </PeerProvider>
      </LanguageProvider>
    </HashRouter>
  );
}

export default App;

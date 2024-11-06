import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BurgerMenu } from './components/BurgerMenu';
import { Home } from './components/Home';
import { HostView } from './components/HostView';
import { JoinGame } from './components/JoinGame';
import { GameBoard } from './components/GameBoard';
import { NotFound } from './components/NotFound';
import { useGameStore } from './store/gameStore';

export function App() {
  const { game, currentPlayer } = useGameStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <BurgerMenu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostView />} />
          <Route path="/join/:gameId" element={<JoinGame />} />
          <Route path="/play" element={
            game && currentPlayer ? (
              <GameBoard player={currentPlayer} isCurrentPlayer={true} />
            ) : (
              <Navigate to="/" />
            )
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="bottom-center" />
      </div>
    </BrowserRouter>
  );
}
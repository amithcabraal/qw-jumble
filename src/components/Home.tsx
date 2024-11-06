import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import toast from 'react-hot-toast';

export function Home() {
  const [word, setWord] = useState('');
  const navigate = useNavigate();
  const { createGame, resetGame } = useGameStore();

  // Reset game state when arriving at home
  React.useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (word.length !== 5) {
      toast.error('Word must be exactly 5 letters');
      return;
    }

    if (!/^[A-Za-z]+$/.test(word)) {
      toast.error('Word must contain only letters');
      return;
    }

    try {
      await createGame(word, navigate);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <Gamepad2 className="w-12 h-12 text-blue-500" />
          <h1 className="text-4xl font-bold ml-4">QuizWordz Jumble</h1>
        </div>

        <form onSubmit={handleCreateGame} className="space-y-6">
          <div>
            <label htmlFor="word" className="block text-sm font-medium text-gray-700">
              Enter a 5-letter word to start a game
            </label>
            <input
              type="text"
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value.toUpperCase())}
              maxLength={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              placeholder="WORDS"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Game
          </button>
        </form>
      </div>
    </div>
  );
}
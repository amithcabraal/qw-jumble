import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, AlertCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { gameService } from '../lib/supabase';
import toast from 'react-hot-toast';

export function JoinGame() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [gameExists, setGameExists] = useState(false);
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { joinGame, resetGame } = useGameStore();

  // Reset game state when joining
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    async function checkGame() {
      if (!gameId) return;
      
      try {
        const { data, error } = await gameService.getGame(gameId);
        if (error) throw error;
        
        if (!data) {
          toast.error('Game not found');
          navigate('/');
          return;
        }

        if (data.status !== 'waiting') {
          toast.error('Game has already started');
          navigate('/');
          return;
        }

        setGameExists(true);
      } catch (error) {
        console.error('Error checking game:', error);
        toast.error('Game not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    checkGame();
  }, [gameId, navigate]);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!gameId) {
      toast.error('Invalid game ID');
      return;
    }

    try {
      setLoading(true);
      await joinGame(gameId, name.trim(), navigate);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-6">This game no longer exists or has already started.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <Users className="w-12 h-12 text-green-500" />
          <h1 className="text-4xl font-bold ml-4">Join Game</h1>
        </div>

        <form onSubmit={handleJoinGame} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Enter your name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2"
              placeholder="Your name"
              maxLength={20}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
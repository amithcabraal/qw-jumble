import { create } from 'zustand';
import { Game, Player } from '../types/game';
import { gameService } from '../lib/supabase';
import toast from 'react-hot-toast';
import { NavigateFunction } from 'react-router-dom';

interface GameStore {
  game: Game | null;
  currentPlayer: Player | null;
  isHost: boolean;
  error: string | null;
  
  createGame: (word: string, navigate: NavigateFunction) => Promise<void>;
  joinGame: (gameId: string, playerName: string, navigate: NavigateFunction) => Promise<void>;
  startGame: () => Promise<void>;
  endGame: () => Promise<void>;
  submitGuess: (guess: string) => Promise<void>;
  shareGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  currentPlayer: null,
  isHost: false,
  error: null,

  createGame: async (word, navigate) => {
    try {
      const hostId = crypto.randomUUID();
      const gameId = await gameService.createGame(hostId, word);
      
      // Set host status before subscription to ensure proper initial state
      set({ isHost: true });

      // Subscribe to game updates
      gameService.subscribeToGame(gameId, (game) => {
        set((state) => ({ 
          ...state,
          game,
          isHost: true // Maintain host status through updates
        }));
      });

      // Get initial game state
      const { data: initialGame } = await gameService.getGame(gameId);
      if (initialGame) {
        set((state) => ({ 
          ...state,
          game: {
            ...initialGame,
            hostId: initialGame.host_id,
            startedAt: initialGame.started_at,
            endedAt: initialGame.ended_at,
          },
          isHost: true
        }));
      }

      // Navigate after state is set
      navigate('/host');
      toast.success('Game created successfully!');
    } catch (error) {
      console.error('Error creating game:', error);
      set({ error: (error as Error).message });
      toast.error('Failed to create game');
    }
  },

  joinGame: async (gameId, playerName, navigate) => {
    try {
      const playerId = crypto.randomUUID();
      const player = {
        id: playerId,
        name: playerName,
        guesses: [],
        results: [],
        solved: false
      };

      await gameService.joinGame(gameId, player);
      
      gameService.subscribeToGame(gameId, (game) => {
        set({ 
          game,
          currentPlayer: game.players.find(p => p.id === playerId) || null,
          isHost: false
        });
      });

      // Get initial game state
      const { data: initialGame } = await gameService.getGame(gameId);
      if (initialGame) {
        set({
          game: {
            ...initialGame,
            hostId: initialGame.host_id,
            startedAt: initialGame.started_at,
            endedAt: initialGame.ended_at,
          },
          currentPlayer: initialGame.players.find(p => p.id === playerId) || null,
          isHost: false
        });
      }

      navigate('/play');
      toast.success('Joined game successfully!');
    } catch (error) {
      console.error('Error joining game:', error);
      set({ error: (error as Error).message });
      toast.error('Failed to join game');
    }
  },

  startGame: async () => {
    const { game } = get();
    if (!game) return;

    try {
      await gameService.updateGameStatus(game.id, 'playing', Date.now());
      toast.success('Game started!');
    } catch (error) {
      console.error('Error starting game:', error);
      set({ error: (error as Error).message });
      toast.error('Failed to start game');
    }
  },

  endGame: async () => {
    const { game } = get();
    if (!game) return;

    try {
      await gameService.updateGameStatus(game.id, 'finished', undefined, Date.now());
      toast.success('Game ended!');
    } catch (error) {
      console.error('Error ending game:', error);
      set({ error: (error as Error).message });
      toast.error('Failed to end game');
    }
  },

  submitGuess: async (guess) => {
    const { game, currentPlayer } = get();
    if (!game || !currentPlayer) return;

    try {
      await gameService.submitGuess(game.id, currentPlayer.id, guess);
      toast.success('Guess submitted!');
    } catch (error) {
      console.error('Error submitting guess:', error);
      set({ error: (error as Error).message });
      toast.error('Failed to submit guess');
    }
  },

  shareGame: () => {
    const { game } = get();
    if (!game) {
      toast.error('No active game to share');
      return;
    }

    const url = `${window.location.origin}/join/${game.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Game link copied to clipboard!');
  },

  resetGame: () => {
    set({
      game: null,
      currentPlayer: null,
      isHost: false,
      error: null
    });
  }
}));
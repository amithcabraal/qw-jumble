import { createClient } from '@supabase/supabase-js';
import { Game, Player } from '../types/game';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const log = {
  info: (message: string, data?: any) => {
    console.log(`[QuizWordz] ${message}`, data);
  },
  error: (message: string, error: any) => {
    console.error(`[QuizWordz] ${message}`, error);
    console.error('[QuizWordz] Error Context:', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }
    });
  }
};

const validateSupabaseCredentials = () => {
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not defined');
  }

  if (!supabaseKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not defined');
  }

  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('VITE_SUPABASE_URL is not valid URL');
  }

  if (!supabaseKey.startsWith('eyJ')) {
    throw new Error('VITE_SUPABASE_ANON_KEY appears to be invalid');
  }

  log.info('Supabase credentials validated successfully');
};

try {
  validateSupabaseCredentials();
} catch (error) {
  log.error('Supabase configuration error:', error);
  toast.error(`Configuration error: ${error.message}`);
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const gameService = {
  async getGame(gameId: string) {
    log.info(`Fetching game: ${gameId}`);
    const response = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();
    
    if (response.error) {
      log.error(`Failed to fetch game ${gameId}:`, response.error);
    } else {
      log.info(`Game ${gameId} fetched successfully`);
    }
    
    return response;
  },

  async createGame(hostId: string, word: string): Promise<string> {
    try {
      log.info('Creating new game');
      const { data, error } = await supabase
        .from('games')
        .insert([{ 
          host_id: hostId, 
          word: word.toUpperCase(), 
          status: 'waiting', 
          players: [] 
        }])
        .select('id')
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error('Failed to create game');

      log.info(`Game created successfully: ${data.id}`);
      return data.id;
    } catch (error) {
      log.error('Failed to create game:', error);
      throw error;
    }
  },

  async joinGame(gameId: string, player: Omit<Player, 'guesses' | 'results' | 'solved'>) {
    try {
      log.info(`Player ${player.name} joining game ${gameId}`);
      const { data: game, error: fetchError } = await this.getGame(gameId);
      
      if (fetchError) throw fetchError;
      if (!game) throw new Error('Game not found');
      if (game.status !== 'waiting') throw new Error('Game has already started');
      if (game.players.length >= 8) throw new Error('Game is full');
      
      const { error } = await supabase.rpc('join_game', {
        p_game_id: gameId,
        p_player: {
          id: player.id,
          name: player.name,
          guesses: [],
          results: [],
          solved: false
        }
      });

      if (error) throw error;
      log.info(`Player ${player.name} successfully joined game ${gameId}`);
    } catch (error) {
      log.error(`Failed to join game ${gameId}:`, error);
      throw error;
    }
  },

  subscribeToGame(gameId: string, callback: (game: Game) => void) {
    log.info(`Subscribing to game updates: ${gameId}`);
    return supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          const game = payload.new as any;
          if (!game) {
            log.error('Received empty game update');
            return;
          }
          
          log.info(`Game update received: ${gameId}`, { 
            status: game.status,
            playerCount: game.players?.length
          });

          callback({
            ...game,
            hostId: game.host_id,
            startedAt: game.started_at,
            endedAt: game.ended_at,
          });
        }
      )
      .subscribe();
  },

  async submitGuess(gameId: string, playerId: string, guess: string) {
    try {
      log.info(`Submitting guess for player ${playerId} in game ${gameId}`);
      const { error } = await supabase.rpc('submit_guess', {
        p_game_id: gameId,
        p_player_id: playerId,
        p_guess: guess.toUpperCase()
      });

      if (error) throw error;
      log.info(`Guess submitted successfully`);
    } catch (error) {
      log.error('Failed to submit guess:', error);
      throw error;
    }
  },

  async updateGameStatus(gameId: string, status: 'waiting' | 'playing' | 'finished', startedAt?: number, endedAt?: number) {
    try {
      log.info(`Updating game ${gameId} status to ${status}`);
      const { error } = await supabase.rpc('update_game_status', {
        p_game_id: gameId,
        p_status: status,
        p_started_at: startedAt,
        p_ended_at: endedAt
      });

      if (error) throw error;
      log.info(`Game status updated successfully`);
    } catch (error) {
      log.error('Failed to update game status:', error);
      throw error;
    }
  }
};
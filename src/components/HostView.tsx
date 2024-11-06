import React from 'react';
import { Users, Timer, Trophy, Copy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { WaitingRoom } from './WaitingRoom';
import { Navigate } from 'react-router-dom';
import { GameBoard } from './GameBoard';
import toast from 'react-hot-toast';

export function HostView() {
  const { game, startGame, endGame, shareGame } = useGameStore();

  // If no game exists in state, redirect to home
  if (!game) {
    console.log('No game found in state, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Show waiting room if game status is 'waiting'
  if (game.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <WaitingRoom
          gameId={game.id}
          word={game.word}
          players={game.players}
          onShare={shareGame}
          onStart={startGame}
        />
      </div>
    );
  }

  const timeElapsed = game.startedAt ? Math.floor((Date.now() - game.startedAt) / 1000) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">QuizWordz Jumble</h1>
          <p className="text-gray-600">Secret Word: <span className="font-mono font-bold">{game.word}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={shareGame}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Copy className="w-5 h-5" />
            Share Game
          </button>
          {game.status === 'playing' && (
            <button
              onClick={endGame}
              className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              End Game
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {game.players.map((player) => (
          <div key={player.id} className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{player.name}</h3>
              {player.solved && game.startedAt && player.timeCompleted && (
                <span className="text-green-500 font-medium">
                  Solved! ({((player.timeCompleted - game.startedAt) / 1000).toFixed(1)}s)
                </span>
              )}
            </div>
            <GameBoard player={player} isCurrentPlayer={false} showLetters={false} />
          </div>
        ))}
      </div>

      {game.status === 'playing' && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-gray-600" />
            <span className="text-xl font-mono">{timeElapsed}s</span>
          </div>
        </div>
      )}

      {game.status === 'finished' && game.startedAt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full m-4">
            <h2 className="text-2xl font-bold mb-6">Game Results</h2>
            <div className="space-y-4">
              {game.winner ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-xl font-bold">{game.winner.name} wins!</p>
                      {game.winner.timeCompleted && (
                        <p className="text-gray-600">
                          Time: {((game.winner.timeCompleted - game.startedAt) / 1000).toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-lg mb-4">
                    Word: <span className="font-mono font-bold">{game.word}</span>
                  </p>
                </>
              ) : (
                <p className="text-xl">No winner this round!</p>
              )}
              
              <table className="w-full mt-6">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-2">Player</th>
                    <th className="text-right py-2">Time</th>
                    <th className="text-right py-2">Guesses</th>
                  </tr>
                </thead>
                <tbody>
                  {game.players
                    .sort((a, b) => (a.timeCompleted || Infinity) - (b.timeCompleted || Infinity))
                    .map((player) => (
                      <tr key={player.id} className="border-b">
                        <td className="py-2">{player.name}</td>
                        <td className="text-right">
                          {player.timeCompleted
                            ? `${((player.timeCompleted - game.startedAt) / 1000).toFixed(1)}s`
                            : '-'}
                        </td>
                        <td className="text-right">{player.guesses.length}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
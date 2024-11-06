import React from 'react';
import { Users, Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface WaitingRoomProps {
  gameId: string;
  word: string;
  players: Array<{ name: string }>;
  onShare: () => void;
  onStart: () => void;
}

export function WaitingRoom({ gameId, word, players, onShare, onStart }: WaitingRoomProps) {
  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    toast.success('Game ID copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Waiting for Players</h2>
            <p className="text-gray-600">Secret Word: <span className="font-mono font-bold">{word}</span></p>
          </div>
          <Users className="w-12 h-12 text-blue-500" />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Share Game Link</p>
                  <p className="text-sm text-gray-600">Send this link to invite players</p>
                </div>
              </div>
              <button
                onClick={onShare}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Game ID</p>
                  <p className="text-sm text-gray-600">Share this code manually</p>
                </div>
              </div>
              <button
                onClick={copyGameId}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="font-mono">{gameId}</span>
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Players ({players.length}/8)</h3>
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Waiting for players to join...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {player.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{player.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <button
              onClick={onStart}
              disabled={players.length === 0}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
            >
              Start Game ({players.length} {players.length === 1 ? 'player' : 'players'})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
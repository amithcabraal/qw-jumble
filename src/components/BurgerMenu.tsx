import React, { useState } from 'react';
import { Menu, X, HelpCircle, Mail, Shield, Share2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import toast from 'react-hot-toast';

export function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const { shareGame, game } = useGameStore();

  const handleShare = () => {
    if (!game) {
      toast.error('No active game to share');
      return;
    }
    shareGame();
    setIsOpen(false);
  };

  const handleContact = () => {
    window.open('mailto:support@quizwordz.com', '_blank');
    setIsOpen(false);
  };

  const handlePrivacy = () => {
    toast.info('Privacy policy coming soon!');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <nav className="mt-12 space-y-4">
              <button 
                onClick={() => {
                  setShowHowTo(true);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                How to Play
              </button>
              
              <button 
                onClick={handleContact}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </button>
              
              <button 
                onClick={handlePrivacy}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Shield className="w-5 h-5" />
                Privacy Policy
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share Game
              </button>
            </nav>
          </div>
        </div>
      )}

      {showHowTo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setShowHowTo(false)}>
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">How to Play QuizWordz Jumble</h2>
            <div className="space-y-4">
              <p>1. <strong>Create a Game:</strong> Enter a 5-letter word to start a new game.</p>
              <p>2. <strong>Share:</strong> Invite friends by sharing the game link or ID.</p>
              <p>3. <strong>Guess:</strong> Players try to guess the word in as few attempts as possible.</p>
              <p>4. <strong>Feedback:</strong></p>
              <ul className="list-disc pl-8 space-y-2">
                <li><span className="bg-green-500 text-white px-2 py-1 rounded">Green</span> - Letter is correct and in the right position</li>
                <li><span className="bg-yellow-500 text-white px-2 py-1 rounded">Yellow</span> - Letter is in the word but wrong position</li>
                <li><span className="bg-gray-500 text-white px-2 py-1 rounded">Gray</span> - Letter is not in the word</li>
              </ul>
              <p>5. <strong>Win:</strong> First player to guess the word correctly wins!</p>
            </div>
            <button
              onClick={() => setShowHowTo(false)}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { MessageCircle, X } from "lucide-react";
import type { Profile } from "@shared/schema";

interface MatchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  myProfile: Profile;
  matchedProfile: Profile & { username: string };
  matchId?: number;
}

export function MatchOverlay({ isOpen, onClose, myProfile, matchedProfile, matchId }: MatchOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <h1 className="font-display text-5xl md:text-6xl text-white italic mb-2">It's a Match!</h1>
            <p className="text-white/70 mb-12">You and {matchedProfile.username} liked each other.</p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mb-16 w-full max-w-sm">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-32 h-32"
            >
              <div className="absolute inset-0 rounded-full border-4 border-white overflow-hidden shadow-2xl">
                <img src={myProfile.photos?.[0]} alt="Me" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            
            <motion.div
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="relative w-32 h-32"
            >
               <div className="absolute inset-0 rounded-full border-4 border-white overflow-hidden shadow-2xl">
                <img src={matchedProfile.photos?.[0]} alt={matchedProfile.username} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            {matchId && (
              <Link href={`/chat/${matchId}`} className="w-full">
                <button className="w-full py-4 rounded-full bg-white text-pink-600 font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  Send a Message
                </button>
              </Link>
            )}
            
            <button 
              onClick={onClose}
              className="w-full py-4 rounded-full bg-transparent border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Keep Swiping
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

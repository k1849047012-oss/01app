import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { MapPin, Info } from "lucide-react";
import { type Profile } from "@shared/schema";

interface SwipeCardProps {
  profile: Profile & { username: string };
  onSwipe: (direction: "left" | "right") => void;
  active: boolean;
}

export function SwipeCard({ profile, onSwipe, active }: SwipeCardProps) {
  const [exitX, setExitX] = useState<number | null>(null);
  
  const x = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);
  
  // Opacity indicators for LIKE / NOPE overlays
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe("right");
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe("left");
    }
  };

  const variants = {
    initial: { scale: 0.95, y: 10, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: (customExitX: number) => ({
      x: customExitX,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    })
  };

  if (!active) return null;

  return (
    <motion.div
      style={{ x, rotate, scale, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      className="w-full h-full p-4 cursor-grab active:cursor-grabbing touch-none"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={exitX}
      variants={variants}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-soft bg-white border border-border/50">
        {/* Main Photo */}
        {profile.photos?.[0] ? (
          <img 
            src={profile.photos[0]} 
            alt={profile.username}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

        {/* Swipe Indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-2 -rotate-12 z-20">
          <span className="text-green-500 font-bold text-4xl tracking-wider uppercase">Like</span>
        </motion.div>
        
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-2 rotate-12 z-20">
          <span className="text-red-500 font-bold text-4xl tracking-wider uppercase">Nope</span>
        </motion.div>

        {/* Info Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10 pointer-events-none">
          <div className="flex items-end gap-3 mb-2">
            <h2 className="text-4xl font-bold font-display shadow-sm">{profile.username}</h2>
            <span className="text-2xl font-medium opacity-90 mb-1">{profile.age}</span>
          </div>

          <div className="flex items-center gap-2 mb-3 text-white/90">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{profile.city}</span>
          </div>

          {profile.bio && (
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <p className="text-sm line-clamp-2 leading-relaxed opacity-90">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

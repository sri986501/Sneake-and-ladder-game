import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import soundManager from '../utils/soundManager';

const SoundController = () => {
  const [muted, setMuted] = useState(soundManager.isMuted);
  const [vol, setVol] = useState(soundManager.volume);
  const [showSlider, setShowSlider] = useState(false);

  const toggleMute = () => {
    soundManager.init();
    const nextMute = !muted;
    soundManager.setMute(nextMute);
    setMuted(nextMute);
    soundManager.playClick();
  };

  const handleVolumeChange = (e) => {
    const nextVol = parseFloat(e.target.value);
    soundManager.setVolume(nextVol);
    setVol(nextVol);
    if (muted && nextVol > 0) {
      soundManager.setMute(false);
      setMuted(false);
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-[#2D1D13] border-2 border-[#5C4033] shadow-2xl transition-all duration-300"
      style={{ position: 'fixed' }}
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button 
        onClick={toggleMute}
        className="p-1.5 rounded-full hover:bg-[#1F140E] text-[#D4AF37] hover:text-[#FAF5EB] transition-colors"
        title={muted ? "Unmute" : "Mute"}
      >
        {muted || vol === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div 
        className={`flex items-center overflow-hidden transition-all duration-300 ${
          showSlider ? 'w-20 opacity-100 mr-1' : 'w-0 opacity-0'
        }`}
      >
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05"
          value={vol}
          onChange={handleVolumeChange}
          className="w-full h-1.5 bg-[#5C4033] rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#D4AF37' }}
        />
      </div>
    </div>
  );
};

export default SoundController;

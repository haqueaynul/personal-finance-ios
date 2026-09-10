import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { DynamicIsland } from './DynamicIsland';
import { BudgetAlert } from '../types';

interface IPhoneFrameProps {
  children: React.ReactNode;
  activeNotification: BudgetAlert | null;
  onTapNotification?: () => void;
  onClearNotification?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  activeNotification,
  onTapNotification,
  onClearNotification,
  soundEnabled,
  onToggleSound
}) => {
  const [timeString, setTimeString] = useState('9:41');
  const [useFrame, setUseFrame] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMins = minutes < 10 ? `0${minutes}` : minutes;
      setTimeString(`${hours}:${formattedMins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none font-sans text-neutral-900">
      {/* Top Floating Control Bar (Desktop view control) */}
      <header className="w-full max-w-md mb-3 px-4 py-2 bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-between text-xs text-neutral-300 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white tracking-wide">iOS 18 Personal Finance</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-sound-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute iOS Audio' : 'Unmute iOS Audio'}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white flex items-center gap-1 text-[11px]"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} className="text-red-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'SFX On' : 'Muted'}</span>
          </button>

          <button
            id="toggle-frame-mode-btn"
            onClick={() => setUseFrame(!useFrame)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white flex items-center gap-1 text-[11px]"
            title={useFrame ? 'Switch to Edge-to-Edge View' : 'Switch to iPhone Frame'}
          >
            {useFrame ? <Monitor size={13} /> : <Smartphone size={13} />}
            <span className="hidden sm:inline">{useFrame ? 'Full View' : 'Device Frame'}</span>
          </button>
        </div>
      </header>

      {/* Main Container: either Phone Frame or Full View */}
      {useFrame ? (
        <div className="relative w-full max-w-[400px] h-[844px] max-h-[92vh] bg-black rounded-[52px] p-[11px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.18),0_0_0_5px_rgba(100,100,110,0.3)] flex flex-col overflow-hidden ring-1 ring-white/20">
          {/* Hardware bezel accents */}
          <div className="absolute -left-[3px] top-[115px] w-[3px] h-[26px] bg-neutral-700 rounded-l-sm" /> {/* Action button */}
          <div className="absolute -left-[3px] top-[160px] w-[3px] h-[48px] bg-neutral-700 rounded-l-sm" /> {/* Vol up */}
          <div className="absolute -left-[3px] top-[220px] w-[3px] h-[48px] bg-neutral-700 rounded-l-sm" /> {/* Vol down */}
          <div className="absolute -right-[3px] top-[170px] w-[3px] h-[72px] bg-neutral-700 rounded-r-sm" /> {/* Power */}

          {/* Screen Content Container */}
          <div className="relative w-full h-full bg-[#F2F2F7] rounded-[42px] overflow-hidden flex flex-col">
            {/* iOS Status Bar */}
            <div className="relative h-12 w-full pt-3 px-7 flex items-center justify-between text-black z-40 shrink-0 font-semibold text-xs tracking-tight">
              <span className="font-semibold text-[13px]">{timeString}</span>

              {/* Dynamic Island sits centrally */}
              <DynamicIsland
                activeNotification={activeNotification}
                onTapNotification={onTapNotification}
                onClearNotification={onClearNotification}
              />

              <div className="flex items-center gap-1.5 text-neutral-800">
                <span className="text-[10px] font-bold tracking-tighter">5G</span>
                <Wifi size={13} strokeWidth={2.5} />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold">98%</span>
                  <BatteryMedium size={16} strokeWidth={2.2} className="text-black" />
                </div>
              </div>
            </div>

            {/* Application Viewport */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
              {children}
            </main>

            {/* iOS Home Indicator Bar */}
            <div className="h-5 w-full flex items-center justify-center pb-1 shrink-0 bg-transparent pointer-events-none z-40">
              <div className="w-36 h-1 bg-neutral-900/40 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Edge to Edge View (Perfect for mobile devices or full width) */
        <div className="w-full max-w-md h-[92vh] bg-[#F2F2F7] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative border border-neutral-800">
          <div className="relative h-11 w-full pt-2 px-6 flex items-center justify-between text-black z-40 shrink-0 font-semibold text-xs">
            <span className="font-semibold text-[13px]">{timeString}</span>
            <DynamicIsland
              activeNotification={activeNotification}
              onTapNotification={onTapNotification}
              onClearNotification={onClearNotification}
            />
            <div className="flex items-center gap-1.5 text-neutral-800">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi size={13} strokeWidth={2.5} />
              <BatteryMedium size={16} strokeWidth={2.2} />
            </div>
          </div>

          <main className="flex-1 overflow-hidden flex flex-col relative">
            {children}
          </main>

          <div className="h-5 w-full flex items-center justify-center pb-1 shrink-0 pointer-events-none z-40">
            <div className="w-36 h-1 bg-neutral-900/40 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};

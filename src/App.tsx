/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, TriangleAlert, Power } from 'lucide-react';

// --- Constants & Types ---
const GRID_SIZE = 20;
const CELL_SIZE = 20;
type Point = { x: number; y: number };
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 }
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

const TRACKS = [
  { id: 1, title: "SECTOR_01_UPLINK", artist: "NEURAL_NET_ALPHA", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://picsum.photos/seed/glitch1/200/200?grayscale" },
  { id: 2, title: "DATA_CORRUPTION", artist: "NEURAL_NET_BETA", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover: "https://picsum.photos/seed/glitch2/200/200?grayscale" },
  { id: 3, title: "SYSTEM_OVERRIDE", artist: "NEURAL_NET_GAMMA", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover: "https://picsum.photos/seed/glitch3/200/200?grayscale" }
];

// --- Components ---

function ProgressBar({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audioRef]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    if (isFinite(audio.duration)) {
      audio.currentTime = percentage * audio.duration;
    }
  };

  return (
    <div className="w-full h-4 bg-[#111] border-2 border-[#00FFFF] cursor-pointer mt-6 relative" onClick={handleSeek}>
      <div
        className="h-full bg-[#FF00FF] transition-all duration-75"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)] pointer-events-none"></div>
    </div>
  );
}

function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const track = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        });
      }
    }
  };

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Auto-play failed:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="bg-black border-4 border-[#FF00FF] p-6 w-full relative overflow-hidden shadow-[8px_8px_0px_#00FFFF]">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFFF] opacity-50 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative w-24 h-24 border-2 border-[#00FFFF] shrink-0 bg-[#111]">
            <img src={track.cover} alt="cover" className={`w-full h-full object-cover mix-blend-luminosity ${isPlaying ? 'opacity-80' : 'opacity-40'}`} referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-[#FF00FF] mix-blend-overlay opacity-50"></div>
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#00FFFF] border-t-transparent animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center h-24">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1 bg-[#00FFFF] text-black text-[10px] font-mono uppercase tracking-widest">AUDIO.LINK_ACTIVE</span>
            </div>
            <h3 className="text-xl font-mono text-[#FF00FF] truncate tracking-tighter uppercase">{track.title}</h3>
            <p className="text-sm font-mono text-[#00FFFF] truncate mt-1 uppercase opacity-70">[{track.artist}]</p>
          </div>
        </div>

        <ProgressBar audioRef={audioRef} />

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 text-[#00FFFF]">
            <Volume2 className="w-5 h-5" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-2 bg-black border border-[#00FFFF] appearance-none cursor-pointer accent-[#FF00FF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={skipBack} className="p-2 bg-black border-2 border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button onClick={togglePlay} className="p-3 bg-[#FF00FF] border-2 border-[#FF00FF] text-black hover:bg-black hover:text-[#FF00FF] transition-colors">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <button onClick={skipForward} className="p-2 bg-black border-2 border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={track.url}
        onEnded={skipForward}
        preload="metadata"
      />
    </div>
  );
}

function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const dirRef = useRef<Point>(INITIAL_DIRECTION);
  const lastProcessedDirRef = useRef<Point>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    dirRef.current = INITIAL_DIRECTION;
    lastProcessedDirRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const resetGame = () => {
    startGame();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver || !isPlaying) return;

      const lastDir = lastProcessedDirRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (lastDir.y === 0) dirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (lastDir.y === 0) dirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (lastDir.x === 0) dirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (lastDir.x === 0) dirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        lastProcessedDirRef.current = dirRef.current;
        const head = prev[0];
        const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          setIsPlaying(false);
          return prev;
        }

        // Self collision
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setIsPlaying(false);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 100); // slightly faster for machine feel
    return () => clearInterval(intervalId);
  }, [isPlaying, gameOver, food, generateFood]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid lines (scanline effect)
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food (Magenta)
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Draw Snake (Cyan)
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF'; // Head is white, body is cyan
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
    
    // Random glitch artifact on canvas
    if (Math.random() > 0.95) {
      ctx.fillStyle = Math.random() > 0.5 ? '#FF00FF' : '#00FFFF';
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 50,
        Math.random() * 10
      );
    }

  }, [snake, food]);

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-[400px]">
      {/* Score Board */}
      <div className="w-full flex justify-between items-end mb-2 px-1">
        <div className="flex items-center gap-2 text-[#00FFFF] bg-black border-2 border-[#00FFFF] px-3 py-1 shadow-[4px_4px_0px_#FF00FF]">
          <span className="text-sm font-mono uppercase tracking-widest">DATA_YIELD:</span>
          <span className="text-xl font-mono font-bold">{score.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative p-2 bg-black border-4 border-[#00FFFF] shadow-[8px_8px_0px_#FF00FF]">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="relative z-10 bg-black block w-full h-auto aspect-square border border-[#333]"
        />

        {/* Overlays */}
        {(!isPlaying && !gameOver) && (
          <div className="absolute inset-2 z-20 flex flex-col items-center justify-center bg-black/90">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-[#00FFFF] text-black font-mono font-bold border-2 border-[#00FFFF] hover:bg-black hover:text-[#00FFFF] transition-none uppercase tracking-widest text-lg shadow-[4px_4px_0px_#FF00FF] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              EXECUTE: SNAKE.EXE
            </button>
            <div className="mt-8 flex gap-6 text-[#FF00FF] font-mono text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <kbd className="w-8 h-8 flex items-center justify-center bg-black border-2 border-[#FF00FF]">W</kbd>
                  <div className="flex gap-1">
                    <kbd className="w-8 h-8 flex items-center justify-center bg-black border-2 border-[#FF00FF]">A</kbd>
                    <kbd className="w-8 h-8 flex items-center justify-center bg-black border-2 border-[#FF00FF]">S</kbd>
                    <kbd className="w-8 h-8 flex items-center justify-center bg-black border-2 border-[#FF00FF]">D</kbd>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-widest mt-2">INPUT_VECTORS</span>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-2 z-20 flex flex-col items-center justify-center bg-black/95 border-4 border-[#FF00FF]">
            <TriangleAlert className="w-12 h-12 text-[#FF00FF] mb-4 animate-pulse" />
            <h2 className="text-4xl font-sans text-[#FF00FF] mb-2 uppercase tracking-widest glitch-text" data-text="SYSTEM FAILURE">SYSTEM FAILURE</h2>
            <p className="text-[#00FFFF] font-mono mb-8 text-lg uppercase">FINAL_YIELD: <span className="font-bold">{score.toString().padStart(4, '0')}</span></p>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-black text-[#FF00FF] font-mono font-bold border-2 border-[#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-none shadow-[4px_4px_0px_#00FFFF] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Power className="w-5 h-5" />
              REBOOT_SEQUENCE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#FF00FF] selection:text-black relative overflow-hidden crt-flicker">
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
        <div className="bg-noise"></div>
      </div>
      
      {/* Scanline */}
      <div className="scanline"></div>

      {/* Header */}
      <header className="w-full p-6 flex justify-center items-center border-b-4 border-[#00FFFF] bg-black z-20 relative">
        <h1 className="text-3xl md:text-5xl font-sans tracking-widest text-white uppercase glitch-text" data-text="SYS.SNAKE // AUDIO.LINK">
          SYS.SNAKE // AUDIO.LINK
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-12 p-6 md:p-12 relative z-10">
        {/* Game Area */}
        <SnakeGame />

        {/* Music Player */}
        <div className="w-full max-w-sm xl:max-w-md">
          <MusicPlayer />
        </div>
      </main>
    </div>
  );
}

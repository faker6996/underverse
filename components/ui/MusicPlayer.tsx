"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, List, X } from "lucide-react";

export interface Song {
  id: number;
  title: string;
  artist?: string;
  duration: string;
  audioUrl: string;
  startTime?: number; // Timestamp bắt đầu (giây) cho file mp3 dài
  endTime?: number; // Timestamp kết thúc (giây) cho file mp3 dài
}

export interface MusicPlayerProps {
  playlist?: Song[];
  autoPlay?: boolean;
  showPlaylist?: boolean;
  className?: string;
}

// Playlist mặc định dùng 1 file mp3 dài với timestamps
const AUDIO_FILE = "/music/As 30 Melhores Músicas Pop 2025  Top Hits em Inglês  As Músicas Pop Mais Escutad.mp3";

const DEFAULT_PLAYLIST: Song[] = [
  { id: 1, title: "Someone You Loved", artist: "Lewis Capaldi", duration: "3:07", audioUrl: AUDIO_FILE, startTime: 0, endTime: 187 },
  {
    id: 2,
    title: "Love Me Like You Do",
    artist: "Ellie Goulding",
    duration: "3:30",
    audioUrl: AUDIO_FILE,
    startTime: 187,
    endTime: 397,
  },
  { id: 3, title: "All Of Me", artist: "John Legend", duration: "5:06", audioUrl: AUDIO_FILE, startTime: 397, endTime: 703 },
  {
    id: 4,
    title: "Always Remember Us This Way",
    artist: "Lady Gaga",
    duration: "3:20",
    audioUrl: AUDIO_FILE,
    startTime: 703,
    endTime: 903,
  },
  { id: 5, title: "Everytime We Touch", artist: "Cascada", duration: "2:52", audioUrl: AUDIO_FILE, startTime: 903, endTime: 1075 },
  { id: 6, title: "At My Worst", artist: "Pink Sweat$", duration: "2:43", audioUrl: AUDIO_FILE, startTime: 1075, endTime: 1238 },
  { id: 7, title: "Sweet But Psycho", artist: "Ava Max", duration: "2:19", audioUrl: AUDIO_FILE, startTime: 1238, endTime: 1377 },
  { id: 8, title: "Love Is Gone", artist: "SLANDER", duration: "2:56", audioUrl: AUDIO_FILE, startTime: 1377, endTime: 1553 },
  { id: 9, title: "Bad Liar", artist: "Imagine Dragons", duration: "4:16", audioUrl: AUDIO_FILE, startTime: 1553, endTime: 1809 },
  { id: 10, title: "Dusk Till Dawn", artist: "ZAYN ft. Sia", duration: "3:43", audioUrl: AUDIO_FILE, startTime: 1809, endTime: 2032 },
  { id: 11, title: "Flowers", artist: "Miley Cyrus", duration: "3:43", audioUrl: AUDIO_FILE, startTime: 2032, endTime: 2255 },
  {
    id: 12,
    title: "You Broke Me First",
    artist: "Tate McRae",
    duration: "3:01",
    audioUrl: AUDIO_FILE,
    startTime: 2255,
    endTime: 2436,
  },
  {
    id: 13,
    title: "Symphony",
    artist: "Clean Bandit ft. Zara Larsson",
    duration: "2:00",
    audioUrl: AUDIO_FILE,
    startTime: 2436,
    endTime: 2557,
  },
  {
    id: 14,
    title: "Dancing With Your Ghost",
    artist: "Sasha Alex Sloan",
    duration: "3:01",
    audioUrl: AUDIO_FILE,
    startTime: 2557,
    endTime: 2738,
  },
  {
    id: 15,
    title: "Let Me Down Slowly",
    artist: "Alec Benjamin",
    duration: "3:33",
    audioUrl: AUDIO_FILE,
    startTime: 2738,
    endTime: 2951,
  },
  { id: 16, title: "Impossible", artist: "James Arthur", duration: "3:26", audioUrl: AUDIO_FILE, startTime: 2951, endTime: 3157 },
  { id: 17, title: "Perfect", artist: "Ed Sheeran", duration: "3:30", audioUrl: AUDIO_FILE, startTime: 3157, endTime: 3367 },
  {
    id: 18,
    title: "La La La",
    artist: "Naughty Boy ft. Sam Smith",
    duration: "2:30",
    audioUrl: AUDIO_FILE,
    startTime: 3367,
    endTime: 3517,
  },
  {
    id: 19,
    title: "Somewhere Only We Know",
    artist: "Keane",
    duration: "3:29",
    audioUrl: AUDIO_FILE,
    startTime: 3517,
    endTime: 3726,
  },
  { id: 20, title: "Diamonds", artist: "Rihanna", duration: "3:05", audioUrl: AUDIO_FILE, startTime: 3726, endTime: 3911 },
  { id: 21, title: "Infinity", artist: "Jaymes Young", duration: "3:12", audioUrl: AUDIO_FILE, startTime: 3911, endTime: 4103 },
  { id: 22, title: "Memories", artist: "Maroon 5", duration: "3:17", audioUrl: AUDIO_FILE, startTime: 4103, endTime: 4300 },
  { id: 23, title: "Closer", artist: "The Chainsmokers", duration: "3:04", audioUrl: AUDIO_FILE, startTime: 4300, endTime: 4484 },
  { id: 24, title: "Save Your Tears", artist: "The Weeknd", duration: "3:10", audioUrl: AUDIO_FILE, startTime: 4484, endTime: 4674 },
  { id: 25, title: "Stereo Love", artist: "Edward Maya", duration: "3:10", audioUrl: AUDIO_FILE, startTime: 4674, endTime: 4864 },
  {
    id: 26,
    title: "Shallow",
    artist: "Lady Gaga & Bradley Cooper",
    duration: "3:30",
    audioUrl: AUDIO_FILE,
    startTime: 4864,
    endTime: 5074,
  },
  { id: 27, title: "Toxic", artist: "Britney Spears", duration: "2:34", audioUrl: AUDIO_FILE, startTime: 5074, endTime: 5228 },
  { id: 28, title: "Some Say", artist: "Nea", duration: "2:57", audioUrl: AUDIO_FILE, startTime: 5228, endTime: 5405 },
  { id: 29, title: "Love Someone", artist: "Lukas Graham", duration: "3:24", audioUrl: AUDIO_FILE, startTime: 5405, endTime: 5609 },
  {
    id: 30,
    title: "You Are The Reason",
    artist: "Calum Scott",
    duration: "3:24",
    audioUrl: AUDIO_FILE,
    startTime: 5609,
    endTime: 5813,
  },
];

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  playlist = DEFAULT_PLAYLIST,
  autoPlay = false,
  showPlaylist: initialShowPlaylist = true,
  className = "",
}) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(initialShowPlaylist);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay was prevented
        setIsPlaying(false);
      });
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    setCurrentSongIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // Nếu có endTime và đã đến thời điểm đó, tự động next
      if (currentSong.endTime && time >= currentSong.endTime) {
        playNext();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      // Nếu có startTime/endTime, dùng khoảng thời gian đó làm duration
      if (currentSong.startTime !== undefined && currentSong.endTime !== undefined) {
        setDuration(currentSong.endTime - currentSong.startTime);
      } else {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const relativeTime = parseFloat(e.target.value);
    setCurrentTime(relativeTime);
    if (audioRef.current) {
      // Nếu có startTime, cộng thêm vào để seek đúng vị trí trong file gốc
      const absoluteTime = (currentSong.startTime || 0) + relativeTime;
      audioRef.current.currentTime = absoluteTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(1);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    // Nếu có startTime, hiển thị thời gian relative
    const displayTime = currentSong.startTime !== undefined ? time - currentSong.startTime : time;
    const minutes = Math.floor(displayTime / 60);
    const seconds = Math.floor(displayTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const playSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      // Seek về startTime của bài mới
      if (currentSong.startTime !== undefined) {
        audioRef.current.currentTime = currentSong.startTime;
      }

      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSongIndex, currentSong.startTime, isPlaying]);

  return (
    <div className={`music-player-container bg-card dark:bg-card border border-border rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      <audio ref={audioRef} src={currentSong.audioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={playNext} />

      <div className="p-6">
        {/* Current Song Info */}
        <div className="text-center mb-6">
          <div className="w-48 h-48 mx-auto mb-4 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-2xl shadow-lg flex items-center justify-center">
            <div className="text-6xl">🎵</div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{currentSong.title}</h2>
          {currentSong.artist && <p className="text-muted-foreground">{currentSong.artist}</p>}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={playPrevious}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground"
          >
            <SkipBack size={24} />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors text-primary-foreground shadow-lg"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button
            onClick={playNext}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground"
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={toggleMute} className="text-foreground hover:text-primary transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Playlist Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-secondary-foreground transition-colors"
          >
            {showPlaylist ? <X size={20} /> : <List size={20} />}
            <span>{showPlaylist ? "Hide Playlist" : "Show Playlist"}</span>
          </button>
        </div>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div data-os-scrollbar className="bg-muted/50 backdrop-blur-sm max-h-96 overflow-y-auto border-t border-border">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Playlist ({playlist.length} songs)</h3>
            <div className="space-y-2">
              {playlist.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => playSong(index)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    index === currentSongIndex ? "bg-primary/20 border border-primary shadow-lg" : "bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {index === currentSongIndex && isPlaying ? "▶" : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{song.title}</p>
                    {song.artist && <p className="text-muted-foreground text-sm truncate">{song.artist}</p>}
                  </div>
                  <div className="text-muted-foreground text-sm shrink-0">{song.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .music-player-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: hsl(var(--primary));
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          .music-player-container input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: hsl(var(--primary));
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          .music-player-container input[type="range"]::-webkit-slider-runnable-track {
            background: linear-gradient(to right, hsl(var(--primary)) var(--progress, 0%), hsl(var(--muted)) var(--progress, 0%));
          }
        `,
        }}
      />
    </div>
  );
};

export default MusicPlayer;

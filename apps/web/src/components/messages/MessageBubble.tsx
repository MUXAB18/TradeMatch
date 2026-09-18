'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/types/messages';
import { CURRENT_USER_ID } from '@/lib/messages/mockData';
import { Check, CheckCheck, MoreHorizontal, Edit2, Trash2, Copy, SmilePlus } from 'lucide-react';
import { format } from 'date-fns';
import { Play, Pause } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

export function MessageBubble({ message, onEdit, onDelete, onReact }: MessageBubbleProps) {
  const isOutgoing = message.senderId === CURRENT_USER_ID;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.text);
  
  const reactions = message.reactions || [];
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const REACTION_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  const toggleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowReactionPicker(false);
  };
  
  const isVoiceNote = message.text.startsWith('🎤 Voice Note');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  // Real Audio reference
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  
  // Mock Audio reference
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscillatorRef = React.useRef<OscillatorNode | null>(null);
  
  // Setup real audio if audioUrl is present
  React.useEffect(() => {
    if (isVoiceNote && message.audioUrl && !audioRef.current) {
      audioRef.current = new Audio(message.audioUrl);
      
      const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          setPlaybackProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.pause();
        }
      };
    }
  }, [isVoiceNote, message.audioUrl]);

  React.useEffect(() => {
    // If we have real audio
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Could not play audio", e));
      } else {
        audioRef.current.pause();
      }
      return;
    }
    
    // Fallback: mock synth for old voice notes without audioUrl
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      // Start mock audio
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext && !audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        
        if (audioCtxRef.current) {
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') ctx.resume();
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 5); 
          
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 5);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          oscillatorRef.current = osc;
        }
      } catch (e) {
        console.error("Audio API not supported or blocked");
      }

      interval = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (oscillatorRef.current) {
              try { oscillatorRef.current.stop(); } catch(e){}
              oscillatorRef.current = null;
            }
            return 0;
          }
          return prev + 2; // Move 2% every 100ms (5 second mock playback)
        });
      }, 100);
    } else {
      // Stop audio if paused
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch(e){}
        oscillatorRef.current = null;
      }
    }
    return () => {
      clearInterval(interval);
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch(e){}
        oscillatorRef.current = null;
      }
    };
  }, [isPlaying]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    // Could add a toast here
  };

  const handleSaveEdit = () => {
    if (editValue.trim() !== '' && editValue !== message.text) {
      onEdit(message.id, editValue);
    }
    setIsEditing(false);
  };

  if (message.deletedAt) {
    return (
      <div className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'} my-2`}>
        <div className="px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 text-text-secondary italic text-[14px]">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex w-full group relative ${isOutgoing ? 'justify-end' : 'justify-start'} my-2 ${reactions.length > 0 ? 'mb-6' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowReactionPicker(false);
      }}
      onClick={(e) => {
        // Toggle action menu on tap for mobile devices
        if (!isHovered) {
          setIsHovered(true);
        } else if ((e.target as HTMLElement).closest('.action-menu')) {
          // If they clicked inside the menu, let the event pass
        } else {
          setIsHovered(false);
          setShowReactionPicker(false);
        }
      }}
    >
      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isOutgoing ? 'items-end' : 'items-start'}`}>
        
        {/* Message Actions Menu (shows on hover/tap) */}
        {(isHovered || showReactionPicker) && !isEditing && (
          <div className={`action-menu absolute -top-8 ${isOutgoing ? 'right-2' : 'left-2'} flex items-center bg-surface border border-border rounded-lg shadow-sm overflow-visible z-50 transition-opacity after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-full after:h-4`}>
            <div className="relative flex items-center">
              <button onClick={() => setShowReactionPicker(!showReactionPicker)} className={`p-1.5 hover:bg-black/5 ${showReactionPicker ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-primary'}`} title="React">
                <SmilePlus size={14} />
              </button>
              {showReactionPicker && (
                <div className={`absolute bottom-full mb-2 ${isOutgoing ? 'right-0' : 'left-0'} bg-surface border border-border rounded-full shadow-lg p-1.5 flex gap-1 z-[60] animate-in slide-in-from-bottom-2 duration-200 after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-full after:h-4`}>
                  {REACTION_OPTIONS.map(emoji => (
                    <button key={emoji} onClick={() => toggleReaction(emoji)} className="w-8 h-8 flex items-center justify-center text-lg hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-transform hover:scale-110">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleCopy} className="p-1.5 hover:bg-black/5 text-text-secondary hover:text-text-primary" title="Copy">
              <Copy size={14} />
            </button>
            {isOutgoing && (
              <>
                <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-black/5 text-text-secondary hover:text-text-primary" title="Edit">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(message.id)} className="p-1.5 hover:bg-error/10 text-text-secondary hover:text-error" title="Delete">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Bubble */}
        <div 
          className={`relative px-4 py-2.5 rounded-2xl text-[15px] shadow-sm ${
            isOutgoing 
              ? 'bg-primary text-white rounded-tr-sm' 
              : 'bg-white dark:bg-black/40 border border-border text-text-primary rounded-tl-sm'
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <textarea 
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-full bg-black/10 dark:bg-black/40 text-white rounded p-2 text-sm outline-none resize-none"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === 'Escape') setIsEditing(false);
                }}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="text-xs text-white/70 hover:text-white">Cancel</button>
                <button onClick={handleSaveEdit} className="text-xs font-bold text-white bg-black/20 px-2 py-1 rounded">Save</button>
              </div>
            </div>
          ) : isVoiceNote ? (
            <div className="flex items-center gap-3 min-w-[180px]">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                  isOutgoing 
                    ? 'bg-white text-primary hover:bg-white/90' 
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
              </button>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-1.5 w-full bg-black/20 dark:bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-100 ${isOutgoing ? 'bg-white' : 'bg-primary'}`}
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
                <div className={`text-[11px] font-medium ${isOutgoing ? 'text-white/80' : 'text-text-secondary'}`}>
                  {message.text.replace('🎤 Voice Note', '').trim()}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {message.attachments?.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.fileType === 'image' ? (
                    <div className="rounded-xl overflow-hidden max-w-[240px] bg-black/10 dark:bg-black/40">
                      <img src={attachment.url} alt={attachment.fileName} className="w-full h-auto object-contain" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-black/10 dark:bg-black/20 p-2 rounded-xl text-[14px]">
                      <div className="p-1.5 bg-black/10 dark:bg-white/10 rounded-lg shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      </div>
                      <span className="truncate font-medium">{attachment.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
              {message.text && (
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              )}
            </div>
          )}
          
          {/* Reactions */}
          {reactions.length > 0 && (
            <div className={`absolute -bottom-3 ${isOutgoing ? 'right-4' : 'left-4'} flex gap-1 z-10 bg-surface rounded-full p-0.5 shadow-sm border border-border`}>
              {reactions.map((r, i) => (
                <button 
                  key={i} 
                  onClick={() => toggleReaction(r.emoji)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-transform hover:scale-105 active:scale-95 ${
                    r.userReacted 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{r.emoji}</span>
                  {r.count > 1 && <span>{r.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-1 mt-1 px-1">
          {message.editedAt && (
            <span className="text-[11px] text-text-secondary mr-1">Edited</span>
          )}
          <span className="text-[11px] text-text-secondary">
            {format(new Date(message.createdAt), 'h:mm a')}
          </span>
          {isOutgoing && (
            <span className="ml-1 text-primary">
              {message.status === 'sent' && <Check size={12} strokeWidth={3} />}
              {message.status === 'delivered' && <CheckCheck size={12} strokeWidth={3} />}
              {message.status === 'read' && <CheckCheck size={12} strokeWidth={3} className="text-success" />}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

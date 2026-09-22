'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { MessageBubble } from './MessageBubble';
import { getInitials } from '@/lib/utils';
import { ArrowLeft, Search, Phone, MoreVertical, Paperclip, Smile, Send, Mic, Square, Trash2, Pause, Play, X } from 'lucide-react';
import Image from 'next/image';
import { format, isSameDay } from 'date-fns';
import { toast } from '@/components/ui/toast';

interface ChatAreaProps {
  onBack: () => void;
  onShowContact: () => void;
}

export function ChatArea({ onBack, onShowContact }: ChatAreaProps) {
  const { 
    conversations, 
    activeConversationId, 
    messages, 
    sendMessage, 
    editMessage, 
    deleteMessage,
    markAsRead,
    reactToMessage
  } = useMessages();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [waveData, setWaveData] = useState<number[]>(Array(30).fill(10));
  const animationRef = useRef<number>(0);

  const COMMON_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '😊', '🙌', '👀', '✨', '💯'];

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Mark as read when entering chat
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, messages.length, markAsRead]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() && !attachedFile && !activeConversationId) return;
    
    const options: any = {};
    if (attachedFile) {
      options.attachments = [{
        id: `att_${Date.now()}`,
        name: attachedFile.name,
        type: attachedFile.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(attachedFile)
      }];
    }
    
    sendMessage(activeConversationId as string, inputValue.trim(), options);
    
    setInputValue('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Scroll will happen automatically due to the effect depending on messages
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Setup real-time visualizer
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateWave = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Take a subset of frequencies for the visualizer
        const newWave = [];
        for (let i = 0; i < 30; i++) {
          // Normalize value between 10% and 100% height
          const val = dataArray[i] || 0;
          newWave.push(Math.max(10, (val / 255) * 100));
        }
        setWaveData(newWave);
        animationRef.current = requestAnimationFrame(updateWave);
      };
      
      updateWave();
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      
      setIsRecording(true);
      setIsRecordingPaused(false);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsRecordingPaused(true);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsRecordingPaused(false);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = (send: boolean) => {
    setIsRecording(false);
    setIsRecordingPaused(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(console.error);
      audioCtxRef.current = null;
      analyserRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const currentRecorder = mediaRecorderRef.current;
      
      currentRecorder.onstop = () => {
        if (send && activeConversationId && recordingTime > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const minutes = Math.floor(recordingTime / 60);
          const seconds = recordingTime % 60;
          const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          
          sendMessage(activeConversationId, `🎤 Voice Note (${formattedTime})`, { audioUrl });
        }
        
        // Stop all tracks to release mic
        currentRecorder.stream.getTracks().forEach(track => track.stop());
        audioChunksRef.current = [];
      };
      
      currentRecorder.stop();
    }
    
    setRecordingTime(0);
  };

  const formatRecordingTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = timeInSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface text-center p-8">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-text-primary mb-2">Your Messages</h2>
        <p className="text-text-secondary mb-6 text-[15px] max-w-sm">Select a conversation from the sidebar to start chatting, or create a new message.</p>
        <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-full text-[14px] hover:shadow-md hover:shadow-primary/25 transition-all">
          Start a New Message
        </button>
      </div>
    );
  }

  const contact = activeConversation.otherParticipant;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfcfc] dark:bg-black relative">
      
      {/* Header */}
      <div className="h-[68px] shrink-0 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden p-2 -ms-2 text-text-secondary hover:bg-black/5 rounded-full">
            <ArrowLeft size={20} />
          </button>
          
          <button onClick={onShowContact} className="flex items-center gap-3 text-start group">
            <div className="relative w-10 h-10 shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                {contact.avatar ? (
                  <Image src={contact.avatar} alt={contact.name} fill className="object-cover" />
                ) : (
                  getInitials(contact.name)
                )}
              </div>
              {contact.online && (
                <div className="absolute bottom-0 end-0 w-3 h-3 bg-[#34C759] rounded-full border-[2.5px] border-surface shadow-sm"></div>
              )}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-text-primary group-hover:text-primary transition-colors leading-tight">
                {contact.name}
              </h2>
              <p className="text-[12px] text-text-secondary font-medium">
                {contact.online ? (
                  <span className="text-success">Online</span>
                ) : (
                  <span>Last seen {contact.lastSeen ? format(new Date(contact.lastSeen), 'h:mm a') : 'recently'}</span>
                )}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => toast.success('Search in conversation feature coming soon')} 
            className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors hidden sm:block"
            title="Search"
          >
            <Search size={20} />
          </button>
          <button 
            onClick={() => toast.success(`Calling ${contact.name}...`)} 
            className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors hidden sm:block"
            title="Call"
          >
            <Phone size={20} />
          </button>
          <button onClick={onShowContact} className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors lg:hidden">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message, index) => {
          const showDateSeparator = index === 0 || !isSameDay(new Date(message.createdAt), new Date(messages[index - 1].createdAt));
          
          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <div className="bg-black/5 dark:bg-white/5 px-4 py-1 rounded-full text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                    {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                  </div>
                </div>
              )}
              <MessageBubble 
                message={message} 
                onEdit={editMessage}
                onDelete={deleteMessage}
                onReact={reactToMessage}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 p-4 bg-surface border-t border-border">
        {isRecording ? (
          <div className="flex items-center gap-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 rounded-2xl p-2.5 shadow-inner">
            <div className={`w-2.5 h-2.5 bg-red-500 rounded-full ${!isRecordingPaused ? 'animate-pulse' : ''} ms-2`} />
            <span className="text-red-600 dark:text-red-400 font-medium text-[15px] shrink-0">
              {formatRecordingTime(recordingTime)}
            </span>
            <div className="flex-1 flex items-center justify-center gap-[3px] h-8 px-4 overflow-hidden">
              {waveData.map((height, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 bg-red-500/80 rounded-full transition-all duration-75 ${isRecordingPaused ? 'opacity-50' : ''}`}
                  style={{ height: isRecordingPaused ? '10%' : `${height}%` }}
                />
              ))}
            </div>
            <button 
              onClick={() => stopRecording(false)} 
              className="p-2 text-text-secondary hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
              title="Cancel recording"
            >
              <Trash2 size={20} />
            </button>
            {isRecordingPaused ? (
              <button 
                onClick={resumeRecording} 
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Resume recording"
              >
                <Play size={20} className="fill-current" />
              </button>
            ) : (
              <button 
                onClick={pauseRecording} 
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Pause recording"
              >
                <Pause size={20} className="fill-current" />
              </button>
            )}
            <button 
              onClick={() => stopRecording(true)}
              className="p-2 bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 rounded-xl shrink-0 transition-all transform hover:scale-105"
              title="Send Voice Note"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-black/5 dark:bg-white/5 rounded-2xl p-2 focus-within:ring-2 ring-primary/20 transition-shadow">
            {attachedFile && (
              <div className="flex items-center gap-3 p-2 bg-white dark:bg-black/40 rounded-xl mx-1 mt-1 border border-border">
                {attachedFile.type.startsWith('image/') ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative bg-black/5">
                    <img src={URL.createObjectURL(attachedFile)} alt="Attachment" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Paperclip size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-text-primary truncate">{attachedFile.name}</p>
                  <p className="text-[12px] text-text-secondary">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => {
                    setAttachedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }} 
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-text-secondary hover:text-red-500 transition-colors me-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 w-full">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-xl shrink-0 transition-colors"
                title="Attach a file"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAttachment}
                className="hidden" 
              />
              
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 max-h-[120px] bg-transparent resize-none py-2.5 outline-none text-[15px] text-text-primary placeholder:text-text-secondary/70 min-h-[44px]"
                rows={1}
              />

              <div className="relative">
              {showEmojiPicker && (
                <div className="absolute bottom-full end-0 mb-4 bg-surface border border-border rounded-xl shadow-xl p-3 flex flex-wrap gap-2 w-[240px] z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-full text-[12px] font-bold text-text-secondary mb-1">Common Emojis</div>
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInputValue(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-10 h-10 flex items-center justify-center text-[22px] hover:bg-surface-hover rounded-lg transition-colors transform hover:scale-110 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl shrink-0 transition-colors hidden sm:block ${
                  showEmojiPicker 
                    ? 'text-primary bg-primary/10' 
                    : 'text-text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                title="Emojis"
              >
                <Smile size={20} />
              </button>
            </div>

            <button 
              onClick={startRecording}
              className="p-2.5 text-text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-xl shrink-0 transition-colors hidden sm:block"
              title="Send voice note"
            >
              <Mic size={20} />
            </button>
            
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() && !attachedFile}
              className={`p-2.5 rounded-xl shrink-0 transition-all ${
                inputValue.trim() || attachedFile
                  ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-hover' 
                  : 'bg-black/10 dark:bg-white/10 text-text-secondary/50 cursor-not-allowed'
              }`}
            >
              <Send size={20} className={inputValue.trim() || attachedFile ? 'translate-x-0.5 -translate-y-0.5' : ''} />
            </button>
            </div>
          </div>
        )}
        <div className="text-center mt-2 text-[11px] text-text-secondary font-medium hidden sm:block">
          Press <span className="font-bold">Enter</span> to send, <span className="font-bold">Shift + Enter</span> for new line
        </div>
      </div>
      
    </div>
  );
}

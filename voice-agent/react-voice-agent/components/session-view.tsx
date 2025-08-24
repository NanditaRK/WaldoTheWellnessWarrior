'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  type ReceivedChatMessage,
  useRoomContext,
  useVoiceAssistant,
} from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { MediaTiles } from '@/components/livekit/media-tiles';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

function isAgentAvailable(agentState: AgentState) {
  return agentState === 'listening' || agentState === 'thinking' || agentState === 'speaking';
}

interface SessionViewProps {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
  className?: string;
}

export const SessionView = ({
  appConfig,
  disabled,
  sessionStarted,
  className,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const { state: agentState } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(true);
  const { messages, send } = useChatAndTranscription();
  const room = useRoomContext();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useDebugMode({
    enabled: process.env.NODE_END !== 'production',
  });

  async function handleSendMessage(message: string) {
    await send(message);
  }

  // auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (sessionStarted) {
      const timeout = setTimeout(() => {
        if (!isAgentAvailable(agentState)) {
          const reason =
            agentState === 'connecting'
              ? 'Agent did not join the room.'
              : 'Agent connected but did not complete initializing.';

          toastAlert({
            title: 'Session ended',
            description: (
              <p className="w-full">
                {reason}{' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.livekit.io/agents/start/voice-ai/"
                  className="whitespace-nowrap underline"
                >
                  Learn more
                </a>
                .
              </p>
            ),
          });
          room.disconnect();
        }
      }, 10_000);

      return () => clearTimeout(timeout);
    }
  }, [agentState, sessionStarted, room]);

  const { supportsVideoInput, supportsScreenShare } = appConfig;
  const capabilities = {
    supportsChatInput: true,
    supportsVideoInput,
    supportsScreenShare,
  };

  return (
    <motion.main
      ref={ref}
      inert={disabled}
      className={cn(
        'flex flex-col h-svh bg-background rounded-xl shadow-lg transition-all duration-500 ease-out',
        className
      )}
    >
      {/* Split Screen: Media Left | Chat Right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Agent / Media */}
        <div className="flex-1 flex items-center justify-center bg-muted">
          <MediaTiles chatOpen={chatOpen} />
        </div>

        {/* Right: Chat */}
        <div className="w-full max-w-md border-l border-border flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
            <AnimatePresence>
              {messages.map((message: ReceivedChatMessage) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="rounded-lg bg-muted p-3 whitespace-pre-wrap break-words">
                    <ChatEntry entry={message} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Bottom: Control Bar */}
      <div className="bg-background sticky bottom-0 z-50 px-3 pt-2 pb-3 md:px-12 md:pb-6 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        <motion.div
          key="control-bar"
          initial={{ opacity: 0, translateY: '100%' }}
          animate={{
            opacity: sessionStarted ? 1 : 0,
            translateY: sessionStarted ? '0%' : '100%',
          }}
          transition={{ duration: 0.3, delay: sessionStarted ? 0.3 : 0, ease: 'easeOut' }}
        >
          <div className="relative z-10 mx-auto w-full max-w-2xl">
            <AgentControlBar
              capabilities={capabilities}
              onChatOpenChange={setChatOpen}
              onSendMessage={handleSendMessage}
            />
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
};

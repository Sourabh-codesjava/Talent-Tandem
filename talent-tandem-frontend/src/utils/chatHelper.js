// Chat timing helper utilities

export const CHAT_PRE_SESSION_MINUTES = 5;

export const getChatStatus = (sessionTime) => {
  const now = new Date();
  const sessionStart = new Date(sessionTime);
  const chatStartTime = new Date(sessionStart.getTime() - CHAT_PRE_SESSION_MINUTES * 60 * 1000);
  
  const isChatEnabled = now >= chatStartTime;
  const isSessionStarted = now >= sessionStart;
  const timeUntilChat = Math.max(0, chatStartTime - now);
  const timeUntilSession = Math.max(0, sessionStart - now);
  
  return {
    isChatEnabled,
    isSessionStarted,
    isPreSession: isChatEnabled && !isSessionStarted,
    timeUntilChat,
    timeUntilSession,
    chatStartTime,
    sessionStartTime: sessionStart
  };
};

export const formatTimeRemaining = (milliseconds) => {
  if (milliseconds <= 0) return 'Now';
  
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const getChatMessage = (status) => {
  if (status.isSessionStarted) {
    return 'Session is live';
  }
  if (status.isPreSession) {
    return `Session starts in ${formatTimeRemaining(status.timeUntilSession)}`;
  }
  return `Chat available in ${formatTimeRemaining(status.timeUntilChat)}`;
};

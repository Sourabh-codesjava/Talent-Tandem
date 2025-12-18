// COMPLETE SESSION FLOW LOGIC

import apiService from '../services/api';

// 1. START SESSION BUTTON (Mentor only, when ACCEPTED)
export const shouldShowStartButton = (session, currentUserId) => {
  return session.mentorId === currentUserId && session.status === 'ACCEPTED';
};

// 2. PRE-CHAT CONTROL (Only when ACCEPTED, disable when LIVE)
export const isPreChatEnabled = (session) => {
  return session.status === 'ACCEPTED';
};

export const isPreChatDisabled = (session) => {
  return session.status === 'LIVE' || session.status === 'COMPLETED';
};

// 3. START SESSION - Opens video/session conduct interface
export const handleStartSession = async (sessionId, onSuccess) => {
  try {
    await apiService.startSession(sessionId);
    onSuccess(); // Re-fetch session, status becomes LIVE
  } catch (error) {
    throw new Error(error.message || 'Failed to start session');
  }
};

// 4. SESSION CONDUCT - Check if session is live
export const isSessionLive = (session) => {
  return session.status === 'LIVE';
};

// 5. COMPLETE SESSION - Updates coins and opens feedback
export const handleCompleteSession = async (sessionId, onSuccess) => {
  try {
    await apiService.completeSession(sessionId);
    const wallet = await apiService.getWallet();
    onSuccess(wallet); // Update wallet, open feedback form
    return wallet;
  } catch (error) {
    throw new Error(error.message || 'Failed to complete session');
  }
};

// 6. FEEDBACK SUBMISSION
export const handleSubmitFeedback = async (feedbackData, onSuccess) => {
  try {
    await apiService.submitFeedback(feedbackData);
    onSuccess(); // Close feedback form, show success
  } catch (error) {
    throw new Error(error.message || 'Failed to submit feedback');
  }
};

// 7. ZERO COINS CHECK (Learner only)
export const shouldShowZeroCoinsModal = (wallet, userRole) => {
  return userRole === 'LEARNER' && wallet.coins === 0;
};

// 8. COMPLETE SESSION BUTTON (Mentor only, when LIVE)
export const shouldShowCompleteButton = (session, currentUserId) => {
  return session.mentorId === currentUserId && session.status === 'LIVE';
};

import ApiService from '../services/api';

export const handleJoinSession = async (sessionId, onSuccess, onError, onForceTeacher) => {
  try {
    const response = await ApiService.joinSession(sessionId);
    
    if (response.forceBecomeTeacher) {
      onForceTeacher(response);
    } else {
      onSuccess(response);
    }
    
    return response;
  } catch (error) {
    if (error.message.includes('Insufficient coins')) {
      onError('Insufficient coins. Please become a teacher to earn coins.');
    } else {
      onError(error.message || 'Failed to join session');
    }
    throw error;
  }
};

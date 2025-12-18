package com.talent_tandem.service;

import com.talent_tandem.requestdto.AddParticipantRequest;
import com.talent_tandem.responsedto.SessionParticipantResponse;
import com.talent_tandem.responsedto.SessionWithParticipantsResponse;
import java.util.List;

public interface ISessionParticipantService {
    
    List<SessionParticipantResponse> addParticipants(AddParticipantRequest request);
    SessionWithParticipantsResponse getSessionWithParticipants(Long sessionId);
    void removeParticipant(Long participantId);
    List<SessionParticipantResponse> getUserParticipations(Long userId);
}
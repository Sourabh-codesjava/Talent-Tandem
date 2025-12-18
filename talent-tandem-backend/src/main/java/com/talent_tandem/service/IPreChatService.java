package com.talent_tandem.service;

import com.talent_tandem.requestdto.PreChatRequest;
import com.talent_tandem.responsedto.PreChatResponse;
import java.util.List;

public interface IPreChatService {
    PreChatResponse sendMessage(PreChatRequest request, Long senderId);
    List<PreChatResponse> getMessages(Long sessionId, Long userId);
}

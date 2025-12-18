package com.talent_tandem.controller;
import com.talent_tandem.requestdto.PreChatRequest;
import com.talent_tandem.responsedto.PreChatResponse;
import com.talent_tandem.security.JwtUtil;
import com.talent_tandem.service.IPreChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class PreChatController {

    private final IPreChatService preChatService;
    private final JwtUtil jwtUtil;

    @PostMapping("/send")
    public PreChatResponse sendMessage(
            @Valid @RequestBody PreChatRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        Long senderId = jwtUtil.extractUserId(token);
        
        return preChatService.sendMessage(request, senderId);
    }

    @GetMapping("/{sessionRequestId}")
    public List<PreChatResponse> getChatMessages(
            @PathVariable Long sessionRequestId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        
        return preChatService.getMessages(sessionRequestId, userId);
    }
}

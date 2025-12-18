package com.talent_tandem.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    // Temporary in-memory storage (replace with database later)
    private Map<Long, List<Map<String, Object>>> chatStorage = new HashMap<>();

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Map<String, Object>>> getChatMessages(@PathVariable Long sessionId) {
        List<Map<String, Object>> messages = chatStorage.getOrDefault(sessionId, new ArrayList<>());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> messageData) {
        Long sessionId = Long.valueOf(messageData.get("sessionId").toString());
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("messageId", System.currentTimeMillis());
        response.put("sessionId", sessionId);
        response.put("senderId", messageData.get("senderId"));
        response.put("content", messageData.get("content"));
        response.put("type", messageData.get("type"));
        response.put("sentAt", LocalDateTime.now().toString());
        
        // Store in memory
        chatStorage.computeIfAbsent(sessionId, k -> new ArrayList<>()).add(response);
        
        System.out.println("Chat message saved: " + response);
        
        return ResponseEntity.ok(response);
    }
}

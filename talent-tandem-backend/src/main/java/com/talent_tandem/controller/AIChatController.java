package com.talent_tandem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-chat")
@CrossOrigin(origins = "*")
public class AIChatController {

    private final ChatClient chatClient;

    public AIChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        
        if (userMessage == null || userMessage.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("response", "Please provide a message.");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            String prompt = String.format(
                "You are a helpful support assistant for Talent Tandem, a mentorship platform. " +
                "Answer this question professionally and concisely: %s", 
                userMessage
            );

            String aiResponse = chatClient.prompt(prompt).call().content();
            
            Map<String, String> response = new HashMap<>();
            response.put("response", aiResponse != null ? aiResponse.trim() : "I'm here to help! Could you please rephrase your question?");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("response", "I'm having trouble processing your request. Please try again.");
            return ResponseEntity.ok(error);
        }
    }
}

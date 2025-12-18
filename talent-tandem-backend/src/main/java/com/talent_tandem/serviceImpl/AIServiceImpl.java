package com.talent_tandem.serviceImpl;

import com.talent_tandem.service.IAIService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class AIServiceImpl implements IAIService {

    private final ChatClient chatClient;

    public AIServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public List<String> normalizeSkills(List<String> rawSkills) {
        if (rawSkills == null || rawSkills.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            String prompt = String.format(
                    "Normalize these skills into standardized terms: %s. Return only comma-separated normalized skills.",
                    String.join(", ", rawSkills));

            String response = chatClient.prompt(prompt).call().content();
            if (response == null || response.trim().isEmpty()) {
                return Collections.emptyList();
            }
            return Arrays.asList(response.trim().split(",\\s*"));
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Override
    public String generateMatchExplanation(String mentorName, List<String> matchingSkills, String experience,
            String timeSlot) {
        if (mentorName == null || matchingSkills == null || matchingSkills.isEmpty()) {
            return "No match explanation available.";
        }

        try {
            String prompt = String.format(
                    "Generate a short match explanation for mentor %s with %s experience, matching skills: %s, available at %s ,note:Just provide the match explaination ",
                    mentorName, experience != null ? experience : "unspecified",
                    String.join(", ", matchingSkills), timeSlot != null ? timeSlot : "flexible");

            String response = chatClient.prompt(prompt).call().content();
            return response != null && !response.trim().isEmpty() ? response.trim() : "No match explanation available.";
        } catch (Exception e) {
            return "No match explanation available.";
        }
    }
}

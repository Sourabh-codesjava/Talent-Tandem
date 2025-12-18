package com.talent_tandem.service;

import java.util.List;

public interface IAIService {
    List<String> normalizeSkills(List<String> rawSkills);
    String generateMatchExplanation(String mentorName, List<String> matchingSkills, String experience, String timeSlot);
}
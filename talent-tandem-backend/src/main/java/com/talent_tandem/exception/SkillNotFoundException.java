package com.talent_tandem.exception;

public class SkillNotFoundException extends RuntimeException {
    public SkillNotFoundException(String message) {
        super(message);
    }
    
    public SkillNotFoundException(Long skillId) {
        super("Skill not found with ID: " + skillId);
    }
}
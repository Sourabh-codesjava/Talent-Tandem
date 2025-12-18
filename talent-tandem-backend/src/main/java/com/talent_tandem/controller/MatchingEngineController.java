package com.talent_tandem.controller;
import com.talent_tandem.requestdto.MatchRequest;
import com.talent_tandem.responsedto.MentorMatchResponse;
import com.talent_tandem.service.IMatchingEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/match-engine")
@RequiredArgsConstructor
public class MatchingEngineController {

    private final IMatchingEngineService service;

    @PostMapping("/find")
    public ResponseEntity<Map<String, Object>> findMatches(
            @Valid @RequestBody MatchRequest request) {

        List<MentorMatchResponse> matches = service.findMatches(request);
        Map<String, Object> response = new HashMap<>();
        response.put("status", true);
        response.put("matches", matches);
        response.put("count", matches.size());
        
        if (matches.isEmpty()) {
            response.put("message", "No mentors found matching your criteria. Try adjusting your search preferences.");
        } else {
            response.put("message", "Found " + matches.size() + " mentor(s) matching your criteria.");
        }
        
        return ResponseEntity.ok(response);
    }
}

package com.talent_tandem.service;
import com.talent_tandem.requestdto.MatchRequest;
import com.talent_tandem.responsedto.MentorMatchResponse;
import java.util.List;

public interface IMatchingEngineService {

    List<MentorMatchResponse> findMatches(MatchRequest request);
}
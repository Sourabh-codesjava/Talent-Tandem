package com.talent_tandem.service;

import org.springframework.stereotype.Service;

import com.talent_tandem.responsedto.AnalyticsResponseDTO;

@Service
public interface IAnalyticsService {
    AnalyticsResponseDTO getUserAnalytics(Long userId);
}

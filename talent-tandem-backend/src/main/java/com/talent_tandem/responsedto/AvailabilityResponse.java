package com.talent_tandem.responsedto;
import lombok.Data;

@Data
public class AvailabilityResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
}

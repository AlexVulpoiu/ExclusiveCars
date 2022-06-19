package com.fmi.exclusiveCars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAppointmentResponseDto {

    private String user;

    @JsonProperty("user_id")
    private Long userId;

    private String phone;

    @JsonProperty("service_id")
    private Long autoServiceId;

    @JsonProperty("auto_service")
    private String autoService;

    @JsonProperty("problem_description")
    private String problemDescription;

    private LocalDate date;

    private LocalTime hour;

    @JsonProperty("station_number")
    private Integer stationNumber;
}

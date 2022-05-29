package com.fmi.exclusiveCars.dto;

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

    private String autoService;

    private String problemDescription;

    private LocalDate date;

    private LocalTime hour;

    private Integer stationNumber;
}

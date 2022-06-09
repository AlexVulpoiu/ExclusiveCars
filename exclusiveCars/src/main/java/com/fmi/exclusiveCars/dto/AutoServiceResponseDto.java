package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoServiceResponseDto {

    private Long id;

    private String name;

    private String city;

    private String address;

    private Integer numberOfStations;

    private LocalTime startHour;

    private LocalTime endHour;

    private String email;

    private String phone;

    private String organisation;
}

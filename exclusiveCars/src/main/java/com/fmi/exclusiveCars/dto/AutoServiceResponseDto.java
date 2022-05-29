package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private String email;

    private String phone;

    private String organisation;
}

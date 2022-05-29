package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalCenterResponseDto {

    private Long id;

    private String name;

    private String city;

    private String address;

    private String email;

    private String phone;

    private String organisation;
}

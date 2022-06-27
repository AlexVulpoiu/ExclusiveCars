package com.fmi.exclusiveCars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganisationResponseDto {

    private Long id;

    private String name;

    private String owner;

    private String email;

    @JsonProperty("owner_id")
    private Long ownerId;

    @JsonProperty("auto_services")
    private List<AutoServiceResponseDto> autoServices;

    @JsonProperty("rental_centers")
    private List<RentalCenterResponseDto> rentalCenters;
}

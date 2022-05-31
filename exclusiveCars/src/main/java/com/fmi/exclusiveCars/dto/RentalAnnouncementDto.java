package com.fmi.exclusiveCars.dto;

import com.fmi.exclusiveCars.model.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalAnnouncementDto {

    private Long id;

    private Long carId;

    private String carManufacturer;

    private String carModel;

    private ECategory carCategory;

    private Integer price;

    private Double carRating;
}

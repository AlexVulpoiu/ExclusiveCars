package com.fmi.exclusiveCars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fmi.exclusiveCars.model.EFuelType;
import com.fmi.exclusiveCars.model.EStandard;
import com.fmi.exclusiveCars.model.EGearbox;
import com.fmi.exclusiveCars.model.ETransmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarDto {

    @NotNull(message = "You should provide a valid model for this car!")
    @JsonProperty("car_model_id")
    private Long carModelId;

    @NotNull(message = "You should provide a value for the price!")
    @Min(value = 0, message = "The price must be a positive integer!")
    private Integer price;

    @NotNull(message = "You should provide a valid value for negotiable price feature!")
    private Boolean negotiable;

    @NotBlank(message = "You should provide a valid color for this car!")
    @Pattern(regexp = "^[a-z][\\sa-z]{2,9}$")
    private String color;

    @NotNull(message = "You should provide a valid year for this car!")
    @Min(value = 1950, message = "The year can't be older than 1950!")
    private Integer year;

    @NotBlank(message = "You should provide a valid country name!")
    @Size(min = 4, max = 20, message = "Country name should have between 4 and 20 characters!")
    private String country;

    @NotBlank(message = "You should provide a valid location name!")
    @Size(min = 3, max = 30, message = "Location name should have between 3 and 30 characters!")
    private String location;

    @NotNull(message = "You should provide a valid number of kilometers for this car!")
    @Min(value = 0, message = "The number of kilometers must be a positive integer!")
    private Integer kilometers;

    @NotNull(message = "You should provide a valid engine capacity for this car!")
    @Min(value = 0, message = "The engine capacity must be a positive integer!")
    private Integer engine;

    @NotNull(message = "You should provide a valid power value for this car!")
    @Min(value = 0, message = "The power value must be a positive integer!")
    private Integer power;

    @NotNull
    @Enumerated(EnumType.STRING)
    private EGearbox gearbox;

    @NotNull
    @Min(value = 4, message = "Number of gears can't be less than 4!")
    @Max(value = 8, message = "Number of gears can't be more than 8!")
    private Integer gears;

    @Enumerated(EnumType.STRING)
    private ETransmission transmission;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JsonProperty("fuel_type")
    private EFuelType fuelType;

    @NotNull(message = "You should provide a valid consumption value for this car!")
    @Min(value = 0, message = "The consumption value must be a positive float!")
    private Double consumption;

    @NotNull(message = "You should provide a valid value for ac feature!")
    private Boolean ac;

    @NotNull(message = "You should provide a valid value for airbag feature!")
    private Boolean airbag;

    @NotNull(message = "You should provide a valid option for emission standard!")
    @Enumerated(EnumType.STRING)
    @JsonProperty("emission_standard")
    private EStandard emissionStandard;

    @NotNull(message = "You should provide a valid number of seats for this car!")
    @Min(value = 2, message = "The number of seats should be at least 2!")
    private Integer seats;
}

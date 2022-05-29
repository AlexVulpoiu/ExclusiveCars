package com.fmi.exclusiveCars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAppointmentDto {

    @NotBlank(message = "You must provide a valid description for the purpose of your visit in our service!")
    @Size(max = 200, message = "The description should have at most 200 characters!")
    @JsonProperty("problem_description")
    private String problemDescription;

    @NotNull(message = "You must provide a valid date!")
    private LocalDate date;

    @NotNull(message = "You must select a valid hour!")
    private LocalTime hour;

    @NotNull(message = "Error at the assignation of a station number!")
    @JsonProperty("station_number")
    private Integer stationNumber;
}

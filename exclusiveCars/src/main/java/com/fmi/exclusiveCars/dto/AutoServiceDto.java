package com.fmi.exclusiveCars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoServiceDto {

    @NotBlank(message = "The name must not be blank!")
    @Size(min = 3, max = 50, message = "The name should contain between 3 and 50 characters!")
    private String name;

    @NotBlank(message = "The city must not be blank!")
    @Size(min = 4, max = 50, message = "The city should contain between 4 and 50 characters!")
    private String city;

    @NotBlank(message = "The address must not be blank!")
    @Size(min = 20, max = 200, message = "The city should contain between 20 and 200 characters!")
    private String address;

    @NotNull(message = "You should provide a value for the number of stations!")
    @Min(value = 0, message = "The number of stations can't be negative or 0!")
    @JsonProperty("number_of_stations")
    private Integer numberOfStations;

    @NotBlank(message = "The email must not be blank!")
    @Size(max = 100, message = "Email size should be at most 100 characters!")
    @Email(message = "The string must follow the email format!")
    private String email;

    @NotBlank(message = "The phone number must not be blank!")
    @Pattern(regexp = "^07\\d{8}$", message = "The phone number should contain 10 digits, starting with 07!")
    private String phone;
}

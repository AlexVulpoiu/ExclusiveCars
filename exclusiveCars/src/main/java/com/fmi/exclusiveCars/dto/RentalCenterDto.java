package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalCenterDto {

    @NotBlank(message = "The name must not be blank!")
    @Pattern(regexp = "^[a-z|A-Z][a-zA-Z0-9\\s]{2,29}$", message = "The name should start with a letter and should have a size between 3 and 30 characters!")
    private String name;

    @NotBlank(message = "City name must not be blank!")
    @Size(min = 4, max = 50, message = "City name should contain between 4 and 50 characters!")
    private String city;

    @NotBlank(message = "The address must not be blank!")
    @Size(min = 10, max = 200, message = "The address should contain between 20 and 200 characters!")
    private String address;

    @NotBlank(message = "Email must not be blank!")
    @Size(max = 100, message = "Email size should be at most 100 characters!")
    @Email(message = "The string must follow the email format!")
    private String email;

    @NotBlank(message = "The phone number must not be blank!")
    @Pattern(regexp = "^07\\d{8}$", message = "The phone number should contain 10 digits, starting with 07!")
    private String phone;
}

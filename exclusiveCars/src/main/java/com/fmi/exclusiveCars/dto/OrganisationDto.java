package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganisationDto {

    @NotBlank(message = "The name of the organisation can't be blank!")
    @Pattern(regexp = "^[A-Z].{2,29}$", message = "The name of the organisation should start with capital letter and contains between 3 and 30 characters!")
    private String name;
}

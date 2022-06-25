package com.fmi.exclusiveCars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellingAnnouncementDto {

    @NotNull(message = "Trebuie să specificați detalille autovehiculului!")
    @JsonProperty("car_dto")
    private CarDto carDto;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Trebuie să specificați dacă prețul este negociabil!")
    private Boolean negotiable;

    @NotBlank(message = "Trebuie să specificați locația!")
    @Pattern(regexp = "^[A-Z][A-Za-z\\s-]{2,29}$",
            message = "Locația trebuie să înceapă cu majusculă și să aibă între 3 și 30 de caractere (litere, spații sau cratimă)!")
    private String location;
}

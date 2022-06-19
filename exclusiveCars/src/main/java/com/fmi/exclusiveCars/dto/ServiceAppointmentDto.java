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

    @NotBlank(message = "Te rugăm să ne oferi o scurtă descriere despre vizita în service!")
    @Size(max = 200, message = "Descrierea trebuie să aibă maxim 200 de caractere!")
    @JsonProperty("problem_description")
    private String problemDescription;

    @NotNull(message = "Trebuie să alegi o dată validă!")
    private LocalDate date;

    @NotNull(message = "Trebuie să alegi o oră validă!")
    private LocalTime hour;
}

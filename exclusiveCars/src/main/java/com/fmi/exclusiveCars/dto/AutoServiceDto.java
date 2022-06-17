package com.fmi.exclusiveCars.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoServiceDto {

    @NotBlank(message = "Numele nu poate fi un string gol!")
    @Size(min = 3, max = 50, message = "Numele trebuie să aibă între 3 și 50 de caractere!")
    private String name;

    @NotBlank(message = "Orașul nu poate fi un string gol!")
    @Size(min = 4, max = 50, message = "Orașul trebuie să aibă între 4 și 50 de caractere!")
    private String city;

    @NotBlank(message = "Adresa nu poate fi un string gol!")
    @Size(min = 10, max = 100, message = "Orașul trebuie să aibă între 10 și 100 de caractere!")
    private String address;

    @NotNull(message = "Numărul de stații trebuie să fie mai mare decât 0!")
    @Min(value = 0, message = "Numărul de stații trebuie să fie mai mare decât 0!")
    @JsonProperty("number_of_stations")
    private Integer numberOfStations;

    @NotNull(message = "Trebuie să alegeți o valoare pentru ora de start a programului!")
    @JsonProperty("start_hour")
    private LocalTime startHour;

    @NotNull(message = "Trebuie să alegeți o valoare pentru ora de final a programului!")
    @JsonProperty("end_hour")
    private LocalTime endHour;

    @NotBlank(message = "Emailul nu poate fi un string gol!")
    @Size(max = 100, message = "Emailul nu poate avea mai mult de 100 de caractere!")
    @Email(message = "Valoarea introdusă nu respectă formatul unei adrese de email!")
    private String email;

    @NotBlank(message = "Trebuie să introduceți numărul de telefon!")
    @Pattern(regexp = "^07\\d{8}$", message = "Numărul de telefon trebuie să aibă 10 cifre și să înceapă cu '07'!")
    private String phone;
}

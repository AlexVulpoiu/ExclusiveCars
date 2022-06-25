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

    @NotNull(message = "Trebuie să alegi un model dintre cele existente!")
    @JsonProperty("car_model_id")
    private Long carModelId;

    @NotNull(message = "Trebuie să precizezi prețul!")
    @Min(value = 0, message = "Prețul trebuie să fie un număr pozitiv!")
    private Integer price;

    @NotBlank(message = "Trebuie să specifici culoarea mașinii!")
    @Pattern(regexp = "^[a-z][\\sa-z]{2,19}$", message = "Culoarea trebuie să aibă între 3 și 20 de litere!")
    private String color;

    @NotNull(message = "Trebuie să alegi anul fabricării mașinii!")
    @Min(value = 1950, message = "Anul fabricării nu poate fi mai mic decât 1950!")
    private Integer year;

    @NotBlank(message = "Trebuie să specifici țara de origine!")
    @Pattern(regexp = "^[A-Z][\\sA-Za-z-]{3,19}", message = "Numele țării trebuie să aibă între 4 și 20 de caractere!")
    private String country;

    @NotNull(message = "Trebuie să specifici numărul de kilometri pentru acest automobil!")
    @Min(value = 0, message = "Numărul de kilometri trebuie să fie un număr pozitiv!")
    private Integer kilometers;

    @NotNull(message = "Trebuie să specifici capacitatea motorului!")
    @Min(value = 0, message = "Capacitatea motorului trebuie să fie un număr pozitiv!")
    private Integer engine;

    @NotNull(message = "Trebuie să specifici puterea motorului!")
    @Min(value = 0, message = "Puterea motorului trebuie să fie un număr pozitiv!")
    private Integer power;

    @NotNull(message = "Trebuie să alegi tipul cutiei de viteze!")
    @Enumerated(EnumType.STRING)
    private EGearbox gearbox;

    @NotNull(message = "Trebuie să specifici numărul de trepte de viteză!")
    @Min(value = 4, message = "Numărul de trepte de viteză nu poate fi mai mic decât 4!")
    @Max(value = 8, message = "Numărul de trepte de viteză nu poate fi mai mare decât 8!")
    private Integer gears;

    @NotNull(message = "Trebuie să specifici tipul de transmisie!")
    @Enumerated(EnumType.STRING)
    private ETransmission transmission;

    @NotNull(message = "Trebuie să specifici tipul de carburant!")
    @Enumerated(EnumType.STRING)
    @JsonProperty("fuel_type")
    private EFuelType fuelType;

    @NotNull(message = "Trebuie să specifici valoarea consumului mediu!")
    @Min(value = 0, message = "Consumul mediu trebuie să fie un număr pozitiv!")
    private Double consumption;

    @NotNull(message = "Trebuie să specifici dacă autovehiculul dispune de aer condiționat/climatronic!")
    private Boolean ac;

    @NotNull(message = "Trebuie să specifici numărul de airbag-uri!")
    @Min(value = 0, message = "Numărul de airbag-uri trebuie să fie un număr pozitiv!")
    @Max(value = 6, message = "Numărul de airbag-uri trebuie să fie un număr pozitiv mai mic decât 6!")
    private Integer airbags;

    @NotNull(message = "Trebuie să specifici standardul de poluare!")
    @Enumerated(EnumType.STRING)
    @JsonProperty("emission_standard")
    private EStandard emissionStandard;

    @NotNull(message = "Trebuie să specifici numărul de locuri!")
    @Min(value = 2, message = "Numărul de locuri trebuie nu poate fi mai mic decât 2!")
    private Integer seats;
}

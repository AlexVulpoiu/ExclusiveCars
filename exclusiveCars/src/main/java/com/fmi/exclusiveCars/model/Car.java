package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.util.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "cars")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Min(value = 0)
    private Integer price;

    @NotNull
    private Boolean negotiable;

    @NotNull
    @Size(min = 3, max = 10)
    @Column(length = 10)
    private String color;

    @NotNull
    @Min(value = 1950)
    private Integer year;

    @NotBlank
    @Size(min = 4, max = 20)
    @Column(length = 20)
    private String country;

    @NotBlank
    @Size(min = 3, max = 30)
    @Column(length = 30)
    private String location;

    @NotNull
    @Min(value = 0)
    private Integer kilometers;

    @NotNull
    @Min(value = 0)
    private Integer engine;

    @NotNull
    @Min(value = 0)
    private Integer power;

    @Enumerated(EnumType.STRING)
    @Column(length = 21)
    private EGearbox gearbox;

    @NotNull
    @Min(4)
    @Max(8)
    private Integer gears;

    @Enumerated(EnumType.STRING)
    @Column(length = 5)
    private ETransmission transmission;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", length = 8)
    private EFuelType fuelType;

    @NotNull
    @Min(value = 0)
    private Double consumption;

    @NotNull
    @Min(value = 2)
    private Integer seats;

    @NotNull
    private Boolean ac;

    @NotNull
    private Boolean airbag;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "emission_standard", length = 8)
    private EStandard emissionStandard;

    @NotNull
    @Min(value = 0)
    @Max(value = 5)
    private Double rating;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "car_model_id")
    private CarModel model;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RentCar> rentalClients = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Car car = (Car) o;
        return id.equals(car.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

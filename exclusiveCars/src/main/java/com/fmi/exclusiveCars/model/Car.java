package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
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
    @Size(min = 3, max = 10)
    @Column(length = 10)
    private String color;

    @NotNull
    @Min(value = 1950)
    private Integer year;

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

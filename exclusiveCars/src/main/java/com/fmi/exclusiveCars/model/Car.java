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
    @Size(min = 2, max = 30)
    @Column(length = 30)
    private String name;

    @NotNull
    @Size(min = 2, max = 30)
    @Column(length = 30)
    private String model;

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

    @Enumerated(EnumType.STRING)
    @Column(length = 11)
    private ECategory category;

    @NotNull
    @Min(value = 0)
    @Max(value = 5)
    private Double rating;

    @OneToMany(mappedBy = "car", fetch = FetchType.LAZY)
    private List<RentCar> rentalClients = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST}, mappedBy = "favoriteCars")
    private Set<User> users = new HashSet<>();

    public Car(String name, String model, Integer price, String color, Integer year, Integer kilometers, Integer engine, Integer power, ETransmission transmission, EFuelType fuelType, Double consumption, Integer seats, ECategory category, Double rating) {
        this.name = name;
        this.model = model;
        this.price = price;
        this.color = color;
        this.year = year;
        this.kilometers = kilometers;
        this.engine = engine;
        this.power = power;
        this.transmission = transmission;
        this.fuelType = fuelType;
        this.consumption = consumption;
        this.seats = seats;
        this.category = category;
        this.rating = rating;
    }

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

package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.*;

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

    public Car() {
    }

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

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getKilometers() {
        return kilometers;
    }

    public void setKilometers(Integer kilometers) {
        this.kilometers = kilometers;
    }

    public Integer getEngine() {
        return engine;
    }

    public void setEngine(Integer engine) {
        this.engine = engine;
    }

    public Integer getPower() {
        return power;
    }

    public void setPower(Integer power) {
        this.power = power;
    }

    public ETransmission getTransmission() {
        return transmission;
    }

    public void setTransmission(ETransmission transmission) {
        this.transmission = transmission;
    }

    public EFuelType getFuelType() {
        return fuelType;
    }

    public void setFuelType(EFuelType fuelType) {
        this.fuelType = fuelType;
    }

    public Double getConsumption() {
        return consumption;
    }

    public void setConsumption(Double consumption) {
        this.consumption = consumption;
    }

    public Integer getSeats() {
        return seats;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public ECategory getCategory() {
        return category;
    }

    public void setCategory(ECategory category) {
        this.category = category;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public List<RentCar> getRentalClients() {
        return rentalClients;
    }

    public void setRentalClients(List<RentCar> rentalClients) {
        this.rentalClients = rentalClients;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
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

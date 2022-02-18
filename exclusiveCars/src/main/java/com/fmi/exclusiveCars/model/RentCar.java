package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "rent_cars")
public class RentCar {
    @EmbeddedId
    private RentCarId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("carId")
    private Car car;

    @NotNull
    private LocalDate endDate;

    @NotNull
    @Min(value = 0)
    @Column(name = "delay_fee")
    private Integer delayFee;

    public RentCar() {
    }

    public RentCar(User user, Car car, LocalDate startDate, LocalDate endDate, Integer delayFee) {
        this.id = new RentCarId(user.getId(), car.getId(), startDate);
        this.user = user;
        this.car = car;
        this.endDate = endDate;
        this.delayFee = delayFee;
    }

    public RentCarId getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getDelayFee() {
        return delayFee;
    }

    public void setDelayFee(Integer delayFee) {
        this.delayFee = delayFee;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RentCar rentCar = (RentCar) o;
        return id.equals(rentCar.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

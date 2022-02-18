package com.fmi.exclusiveCars.model;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Embeddable
public class RentCarId implements Serializable {
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "car_id")
    private Long carId;

    @Column(name = "start_date")
    private LocalDate startDate;

    public RentCarId() {
    }

    public RentCarId(Long userId, Long carId, LocalDate date) {
        this.userId = userId;
        this.carId = carId;
        this.startDate = date;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RentCarId rentCarId = (RentCarId) o;
        return userId.equals(rentCarId.userId) && carId.equals(rentCarId.carId) && startDate.equals(rentCarId.startDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, carId, startDate);
    }
}

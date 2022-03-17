package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Embeddable
public class RentCarId implements Serializable {
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "car_id")
    private Long carId;

    @Column(name = "start_date")
    private LocalDate startDate;

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

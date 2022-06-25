package com.fmi.exclusiveCars.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "rent_cars")
public class RentCar {
    @EmbeddedId
    private RentCarId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JsonIgnoreProperties({"roles", "services", "favoriteSellingAnnouncements", "favoriteRentalAnnouncements", "cars",
            "sellingAnnouncements", "organisation"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("carId")
    @JsonIgnoreProperties({"rentalClients"})
    private Car car;

    @NotNull
    private LocalDate endDate;

    public RentCar(User user, Car car, LocalDate startDate, LocalDate endDate) {
        this.id = new RentCarId(user.getId(), car.getId(), startDate);
        this.user = user;
        this.car = car;
        this.endDate = endDate;
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

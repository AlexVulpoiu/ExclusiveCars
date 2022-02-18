package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "rental_announcements")
public class RentalAnnouncement {
    @Id
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private RentalCenter rentalCenter;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Car car;

    public RentalAnnouncement() {
    }

    public Long getId() {
        return id;
    }

    public RentalCenter getRentalCenter() {
        return rentalCenter;
    }

    public void setRentalCenter(RentalCenter rentalCenter) {
        this.rentalCenter = rentalCenter;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RentalAnnouncement that = (RentalAnnouncement) o;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

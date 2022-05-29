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
public class ServiceAppointmentId implements Serializable {
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "auto_service_id")
    private Long serviceId;

    private LocalDate date;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServiceAppointmentId that = (ServiceAppointmentId) o;
        return userId.equals(that.userId) && serviceId.equals(that.serviceId) && date.equals(that.date);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, serviceId, date);
    }
}

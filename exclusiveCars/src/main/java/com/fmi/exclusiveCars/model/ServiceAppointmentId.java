package com.fmi.exclusiveCars.model;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Embeddable
public class ServiceAppointmentId implements Serializable {
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "service_id")
    private Long serviceId;

    private LocalDate date;

    public ServiceAppointmentId() {
    }

    public ServiceAppointmentId(Long userId, Long serviceId, LocalDate date) {
        this.userId = userId;
        this.serviceId = serviceId;
        this.date = date;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

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

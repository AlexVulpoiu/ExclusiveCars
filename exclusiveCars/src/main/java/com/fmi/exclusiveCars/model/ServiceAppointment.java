package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "service_appointments")
public class ServiceAppointment {
    @EmbeddedId
    private ServiceAppointmentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceId")
    private Service service;

    @NotNull
    @Size(max = 200)
    @Column(name = "problem_description", length = 200)
    private String problemDescription;

    @NotNull
    private LocalTime hour;

    @NotNull
    @Column(name = "station_number")
    private Integer stationNumber;

    public ServiceAppointment(User user, Service service, LocalDate date, String problemDescription, LocalTime hour, Integer stationNumber) {
        this.id = new ServiceAppointmentId(user.getId(), service.getId(), date);
        this.user = user;
        this.service = service;
        this.problemDescription = problemDescription;
        this.hour = hour;
        this.stationNumber = stationNumber;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServiceAppointment that = (ServiceAppointment) o;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "services", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class AutoService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 50)
    @Column(length = 50)
    private String name;

    @NotNull
    @Size(min = 4, max = 50)
    @Column(length = 50)
    private String city;

    @NotNull
    @Size(min = 20, max = 200)
    @Column(length = 200)
    private String address;

    @NotNull
    @Column(name = "number_of_stations")
    private Integer numberOfStations;

    @NotBlank
    @Size(max = 100)
    @Column(length = 100)
    @Email
    private String email;

    @NotBlank
    @Size(min = 10, max = 10)
    @Column(length = 10)
    private String phone;

    @OneToMany(mappedBy = "autoService", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceAppointment> users = new ArrayList<>();

    public AutoService(String name, String city, String address, Integer numberOfStations) {
        this.name = name;
        this.city = city;
        this.address = address;
        this.numberOfStations = numberOfStations;
    }
}

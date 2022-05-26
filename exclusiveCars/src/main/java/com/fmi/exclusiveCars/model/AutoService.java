package com.fmi.exclusiveCars.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "services", uniqueConstraints = {@UniqueConstraint(columnNames = "name"),
                                                @UniqueConstraint(columnNames = "email"),
                                                @UniqueConstraint(columnNames = "phone")})
public class AutoService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(length = 50)
    private String name;

    @NotBlank
    @Size(min = 4, max = 50)
    @Column(length = 50)
    private String city;

    @NotBlank
    @Size(min = 20, max = 200)
    @Column(length = 200)
    private String address;

    @NotNull
    @Min(0)
    @Column(name = "number_of_stations")
    @JsonProperty("number_of_stations")
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

    @OneToMany(mappedBy = "autoService", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceAppointment> users = new ArrayList<>();
}

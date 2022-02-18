package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "services", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Service {
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

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceAppointment> users = new ArrayList<>();

    public Service() {
    }

    public Service(String name, String city, String address, Integer numberOfStations) {
        this.name = name;
        this.city = city;
        this.address = address;
        this.numberOfStations = numberOfStations;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getNumberOfStations() {
        return numberOfStations;
    }

    public void setNumberOfStations(Integer numberOfStations) {
        this.numberOfStations = numberOfStations;
    }

    public List<ServiceAppointment> getUsers() {
        return users;
    }

    public void setUsers(List<ServiceAppointment> serviceAppointments) {
        this.users = serviceAppointments;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

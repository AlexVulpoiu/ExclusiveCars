package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rental_centers", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class RentalCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 30)
    @Column(length = 30)
    private String name;

    @NotNull
    @Size(min = 4, max = 50)
    @Column(length = 50)
    private String city;

    @NotNull
    @Size(min = 20, max = 200)
    @Column(length = 200)
    private String address;

    @NotBlank
    @Size(max = 100)
    @Column(length = 100)
    @Email
    private String email;

    @NotBlank
    @Size(min = 10, max = 10)
    @Column(length = 10)
    private String phone;

    @OneToMany(mappedBy = "rentalCenter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RentalAnnouncement> rentalAnnouncements = new ArrayList<>();

    public RentalCenter() {
    }

    public RentalCenter(String name, String city, String address, String email, String phone) {
        this.name = name;
        this.city = city;
        this.address = address;
        this.email = email;
        this.phone = phone;
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

    public List<RentalAnnouncement> getRentalAnnouncements() {
        return rentalAnnouncements;
    }

    public void setRentalAnnouncements(List<RentalAnnouncement> rentalAnnouncements) {
        this.rentalAnnouncements = rentalAnnouncements;
    }

    public void addRentalAnnouncement(RentalAnnouncement announcement) {
        rentalAnnouncements.add(announcement);
        announcement.setRentalCenter(this);
    }

    public void removeRentalAnnouncement(RentalAnnouncement announcement) {
        rentalAnnouncements.remove(announcement);
        announcement.setRentalCenter(null);
    }
}

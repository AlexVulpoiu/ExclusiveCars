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

    public RentalCenter(String name, String city, String address, String email, String phone) {
        this.name = name;
        this.city = city;
        this.address = address;
        this.email = email;
        this.phone = phone;
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

package com.fmi.exclusiveCars.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "rental_centers", uniqueConstraints = {@UniqueConstraint(columnNames = "name"),
                                                    @UniqueConstraint(columnNames = "email"),
                                                    @UniqueConstraint(columnNames = "phone")})
public class RentalCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 30)
    @Column(length = 30)
    private String name;

    @NotBlank
    @Size(min = 4, max = 50)
    @Column(length = 50)
    private String city;

    @NotBlank
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

    @OneToMany(mappedBy = "rentalCenter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RentalAnnouncement> rentalAnnouncements = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Organisation organisation;

    public void addRentalAnnouncement(RentalAnnouncement announcement) {
        rentalAnnouncements.add(announcement);
        announcement.setRentalCenter(this);
    }

    public void removeRentalAnnouncement(RentalAnnouncement announcement) {
        rentalAnnouncements.remove(announcement);
        announcement.setRentalCenter(null);
    }
}

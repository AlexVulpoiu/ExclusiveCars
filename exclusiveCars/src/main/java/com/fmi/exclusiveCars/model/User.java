package com.fmi.exclusiveCars.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.util.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "users", uniqueConstraints = {@UniqueConstraint(columnNames = "email"),
                                            @UniqueConstraint(columnNames = "username"),
                                            @UniqueConstraint(columnNames = "phone")})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 20)
    @Column(length = 20)
    private String username;

    @NotBlank
    @Pattern(regexp = "^[A-Z][a-zA-Z\\s]{2,29}$")
    @Column(name = "first_name", length = 30)
    private String firstName;

    @NotBlank
    @Pattern(regexp = "^[A-Z][a-zA-Z\\s]{2,29}$")
    @Column(name = "last_name", length = 30)
    private String lastName;

    @NotBlank
    @Size(max = 100)
    @Column(length = 100)
    @Email
    private String email;

    @NotBlank
    @Size(max = 120)
    @Column(length = 120)
    private String password;

    @NotBlank
    @Size(min = 10, max = 10)
    @Column(length = 10)
    private String phone;

    @Column(name = "verification_code", length = 64)
    private String verificationCode;

    private Boolean enabled;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceAppointment> services = new ArrayList<>();

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(name = "favorites", joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "car_id"))
    private Set<Car> favoriteCars = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RentCar> cars = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SellingAnnouncement> sellingAnnouncements = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "organisation_id")
    private Organisation organisation;

    public User(String username, String firstName, String lastName, String email, String password, String phone) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    public void addSellingAnnouncement(SellingAnnouncement sellingAnnouncement) {
        sellingAnnouncements.add(sellingAnnouncement);
        sellingAnnouncement.setUser(this);
    }

    public void removeSellingAnnouncement(SellingAnnouncement sellingAnnouncement) {
        sellingAnnouncements.remove(sellingAnnouncement);
        sellingAnnouncement.setUser(null);
    }

    public void addFavoriteCar(Car car) {
        favoriteCars.add(car);
    }

    public void removeFavoriteCar(Car car) {
        favoriteCars.remove(car);
    }

    public void addServiceAppointment(AutoService autoService, ServiceAppointment serviceAppointment) {
        services.add(serviceAppointment);
        autoService.getUsers().add(serviceAppointment);
    }

    public void removeServiceAppointment(ServiceAppointment serviceAppointment) {
        services.remove(serviceAppointment);
        serviceAppointment.setUser(null);
        serviceAppointment.setAutoService(null);
    }

    public void addRentCar(Car car, LocalDate startDate, LocalDate endDate) {
        RentCar rentCar = new RentCar(this, car, startDate, endDate);
        cars.add(rentCar);
        car.getRentalClients().add(rentCar);
    }

    public void removeRentCar(Car car) {
        for(Iterator<RentCar> iterator = cars.iterator(); iterator.hasNext();) {
            RentCar rentCar = iterator.next();

            if(rentCar.getUser().equals(this) && rentCar.getCar().equals(car)) {
                iterator.remove();
                rentCar.getCar().getRentalClients().remove(rentCar);
                rentCar.setUser(null);
                rentCar.setCar(null);
            }
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id.equals(user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

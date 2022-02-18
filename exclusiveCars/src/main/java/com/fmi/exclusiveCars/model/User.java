package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Entity
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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceAppointment> services = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinTable(name = "favorites", joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "car_id"))
    private Set<Car> favoriteCars = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RentCar> cars = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SellingAnnouncement> sellingAnnouncements = new ArrayList<>();

    public User() {
    }

    public User(String username, String email, String password, String phone) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public List<ServiceAppointment> getServices() {
        return services;
    }

    public void setServices(List<ServiceAppointment> serviceAppointments) {
        this.services = serviceAppointments;
    }

    public Set<Car> getFavoriteCars() {
        return favoriteCars;
    }

    public void setFavoriteCars(Set<Car> favoriteCars) {
        this.favoriteCars = favoriteCars;
    }

    public List<RentCar> getCars() {
        return cars;
    }

    public void setCars(List<RentCar> rentedCars) {
        this.cars = rentedCars;
    }

    public List<SellingAnnouncement> getSellingAnnouncements() {
        return sellingAnnouncements;
    }

    public void setSellingAnnouncements(List<SellingAnnouncement> sellingAnnouncements) {
        this.sellingAnnouncements = sellingAnnouncements;
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
        car.getUsers().add(this);
    }

    public void removeFavoriteCar(Car car) {
        favoriteCars.remove(car);
        car.getUsers().remove(this);
    }

    public void addServiceAppointment(Service service, LocalDate date, String problem, LocalTime hour, Integer station) {
        ServiceAppointment serviceAppointment = new ServiceAppointment(this, service, date, problem, hour, station);
        services.add(serviceAppointment);
        service.getUsers().add(serviceAppointment);
    }

    public void removeServiceAppointment(Service service) {
        for(Iterator<ServiceAppointment> iterator = services.iterator(); iterator.hasNext();) {
            ServiceAppointment serviceAppointment = iterator.next();

            if(serviceAppointment.getUser().equals(this) && serviceAppointment.getService().equals(service)) {
                iterator.remove();
                serviceAppointment.getService().getUsers().remove(serviceAppointment);
                serviceAppointment.setUser(null);
                serviceAppointment.setService(null);
            }
        }
    }

    public void addRentCar(Car car, LocalDate startDate, LocalDate endDate, Integer fee) {
        RentCar rentCar = new RentCar(this, car, startDate, endDate, fee);
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

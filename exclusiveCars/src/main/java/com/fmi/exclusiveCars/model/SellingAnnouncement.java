package com.fmi.exclusiveCars.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "selling_announcements")
public class SellingAnnouncement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @NotNull
    private Boolean negotiable;

    @NotBlank
    @Size(min = 3, max = 30)
    @Column(length = 30)
    private String location;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 8)
    private EState state;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "car_id")
    @JsonIgnoreProperties("rentalClients")
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"password", "verificationCode", "enabled", "roles", "services", "favoriteCars", "cars",
            "sellingAnnouncements", "organisation"})
    private User user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SellingAnnouncement that = (SellingAnnouncement) o;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

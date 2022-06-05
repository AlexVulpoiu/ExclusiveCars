package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "car_models")
public class CarModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String model;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(length = 50)
    private String manufacturer;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 11)
    private ECategory category;

    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL)
    private List<Car> cars;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CarModel carModel = (CarModel) o;
        return model.equals(carModel.model) && manufacturer.equals(carModel.manufacturer) && category == carModel.category;
    }

    @Override
    public int hashCode() {
        return Objects.hash(model, manufacturer, category);
    }
}

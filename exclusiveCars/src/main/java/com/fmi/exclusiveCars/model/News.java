package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "news", uniqueConstraints = {@UniqueConstraint(columnNames = "title")})
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 100)
    @Column(length = 100)
    private String title;

    @NotBlank
    @Size(min = 10, max = 10000)
    @Column(length = 10000)
    private String content;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime hour;
}

package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "news", uniqueConstraints = {@UniqueConstraint(columnNames = "title")})
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 100)
    @Column(length = 100)
    private String title;

    @NotNull
    @Size(min = 10, max = 10000)
    @Column(length = 10000)
    private String content;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime hour;

    public News() {
    }

    public News(String title, String content, LocalDate date, LocalTime hour) {
        this.title = title;
        this.content = content;
        this.date = date;
        this.hour = hour;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getHour() {
        return hour;
    }

    public void setHour(LocalTime hour) {
        this.hour = hour;
    }
}

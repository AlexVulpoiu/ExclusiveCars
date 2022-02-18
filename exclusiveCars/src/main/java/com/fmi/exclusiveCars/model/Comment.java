package com.fmi.exclusiveCars.model;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 20)
    @Column(length = 20)
    private String username;

    @NotNull
    @Size(min = 1, max = 1000)
    @Column(length = 1000)
    private String content;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime hour;

    @ManyToOne(fetch = FetchType.LAZY)
    private SellingAnnouncement announcement;

    public Comment() {
    }

    public Comment(String username, String content, LocalDate date, LocalTime hour, SellingAnnouncement announcement) {
        this.username = username;
        this.content = content;
        this.date = date;
        this.hour = hour;
        this.announcement = announcement;
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

    public SellingAnnouncement getAnnouncement() {
        return announcement;
    }

    public void setAnnouncement(SellingAnnouncement announcement) {
        this.announcement = announcement;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Comment comment = (Comment) o;
        return id.equals(comment.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

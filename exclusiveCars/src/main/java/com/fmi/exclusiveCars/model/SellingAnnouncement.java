package com.fmi.exclusiveCars.model;

import lombok.*;

import javax.persistence.*;
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
@Table(name = "selling_announcements")
public class SellingAnnouncement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 5, max = 50)
    @Column(length = 50)
    private String title;

    @NotNull
    @Size(min = 20, max = 1000)
    @Column(length = 1000)
    private String description;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    public SellingAnnouncement(String title, String content, User user, Car car) {
        this.title = title;
        this.description = content;
        this.user = user;
        this.car = car;
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setAnnouncement(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setAnnouncement(null);
    }

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

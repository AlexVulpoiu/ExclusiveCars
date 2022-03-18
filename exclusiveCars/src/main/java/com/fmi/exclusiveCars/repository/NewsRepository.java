package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    Optional<News> findById(Long id);
    Optional<News> findByTitle(String title);
}

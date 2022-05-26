package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.NewsDto;
import com.fmi.exclusiveCars.services.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final NewsService newsService;

    @Autowired
    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("")
    public ResponseEntity<?> getAllNews() {
        return newsService.getAllNews();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNews(@PathVariable Long id) {
        return newsService.getNews(id);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addNews(@Valid @RequestBody NewsDto pieceOfNews) {
        return newsService.addNews(pieceOfNews);
    }

    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> editNews(@PathVariable Long id, @Valid @RequestBody NewsDto news) {
        return newsService.editNews(id, news);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        return newsService.deleteNews(id);
    }
}

package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.model.News;
import com.fmi.exclusiveCars.repository.NewsRepository;
import com.fmi.exclusiveCars.services.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final NewsRepository newsRepository;
    private final NewsService newsService;

    @Autowired
    public NewsController(NewsRepository newsRepository, NewsService newsService) {
        this.newsRepository = newsRepository;
        this.newsService = newsService;
    }

    @GetMapping("")
    public ResponseEntity<List<News>> getAllNews() {
        return new ResponseEntity<>(newsRepository.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNews(@PathVariable Long id) {
        return newsService.getNews(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addNews(@RequestBody News pieceOfNews) {
        return new ResponseEntity<>(newsService.addNews(pieceOfNews), HttpStatus.OK);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editNews(@PathVariable Long id, @RequestBody News news) {
        return newsService.editNews(id, news);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<HttpStatus> deleteNews(@PathVariable Long id) {
        return newsService.deleteNews(id);
    }
}

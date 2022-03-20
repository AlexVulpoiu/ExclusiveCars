package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.News;
import com.fmi.exclusiveCars.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Service
public class NewsService {
    private final NewsRepository newsRepository;

    @Autowired
    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    public ResponseEntity<?> getNews(Long id) {
        Optional<News> pieceOfNews = newsRepository.findById(id);

        if(pieceOfNews.isPresent()) {
            return new ResponseEntity<>(pieceOfNews.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public Long addNews(News pieceOfNews) {
        pieceOfNews.setDate(LocalDate.now());
        pieceOfNews.setHour(LocalTime.now());
        News newPieceOfNews = newsRepository.save(pieceOfNews);

        return newPieceOfNews.getId();
    }

    public ResponseEntity<?> editNews(Long id, News news) {
        Optional<News> pieceOfNews = newsRepository.findById(id);

        if(pieceOfNews.isPresent()) {
            News currentNews = pieceOfNews.get();
            currentNews.setTitle(news.getTitle());
            currentNews.setContent(news.getContent());
            currentNews.setDate(news.getDate());
            currentNews.setHour(news.getHour());
            newsRepository.save(currentNews);

            return new ResponseEntity<>(currentNews, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<HttpStatus> deleteNews(Long id) {
        newsRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}

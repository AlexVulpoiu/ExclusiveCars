package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.NewsDto;
import com.fmi.exclusiveCars.model.News;
import com.fmi.exclusiveCars.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class NewsService {
    private final NewsRepository newsRepository;

    @Autowired
    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    public ResponseEntity<?> getAllNews() {
        Collection<News> news = newsRepository.findAll();
        if(news.isEmpty()) {
            return new ResponseEntity<>("There are no news published yet!", HttpStatus.OK);
        }

        List<News> newsList = new ArrayList<>(news);
        return new ResponseEntity<>(newsList, HttpStatus.OK);
    }

    public ResponseEntity<?> getNews(Long id) {
        Optional<News> pieceOfNews = newsRepository.findById(id);

        if(pieceOfNews.isPresent()) {
            return new ResponseEntity<>(pieceOfNews.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>("The piece of news you asked for doesn't exist!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> addNews(NewsDto pieceOfNews) {
        Optional<News> news = newsRepository.findByTitle(pieceOfNews.getTitle());
        if(news.isPresent()) {
            return new ResponseEntity<>("There is already a piece of news with the same title!", HttpStatus.BAD_REQUEST);
        }

        News newsToAdd = News.builder()
                .title(pieceOfNews.getTitle())
                .content(pieceOfNews.getContent())
                .date(LocalDate.now())
                .hour(LocalTime.now())
                .build();
        newsRepository.save(newsToAdd);

        return new ResponseEntity<>("The news article was successfully added!", HttpStatus.OK);
    }

    public ResponseEntity<?> editNews(Long id, NewsDto news) {
        Optional<News> pieceOfNews = newsRepository.findById(id);

        Optional<News> newsByTitle = newsRepository.findByTitle(news.getTitle());

        if(pieceOfNews.isPresent()) {
            if(newsByTitle.isPresent() && newsByTitle.get() != pieceOfNews.get()) {
                return new ResponseEntity<>("There is already a piece of news with the same title!", HttpStatus.BAD_REQUEST);
            }

            News currentNews = pieceOfNews.get();
            currentNews.setTitle(news.getTitle());
            currentNews.setContent(news.getContent());
            currentNews.setDate(LocalDate.now());
            currentNews.setHour(LocalTime.now());
            newsRepository.save(currentNews);

            return new ResponseEntity<>("The news article was edited successfully!", HttpStatus.OK);
        }

        return new ResponseEntity<>("The news article you have requested to edit doesn't exist!", HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<?> deleteNews(Long id) {
        Optional<News> pieceOfNews = newsRepository.findById(id);

        if(pieceOfNews.isEmpty()) {
            return new ResponseEntity<>("The news article you have requested to delete doesn't exist!", HttpStatus.NOT_FOUND);
        }
        newsRepository.deleteById(id);
        return new ResponseEntity<>("The piece of news was successfully deleted!", HttpStatus.OK);
    }
}

package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.Car;
import com.fmi.exclusiveCars.model.Image;
import com.fmi.exclusiveCars.repository.CarRepository;
import com.fmi.exclusiveCars.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    private final CarRepository carRepository;

    @Autowired
    public ImageService(ImageRepository imageRepository, CarRepository carRepository) {
        this.imageRepository = imageRepository;
        this.carRepository = carRepository;
    }

    public ResponseEntity<?> store(MultipartFile[] multipartFiles, Long carId) throws IOException {

        Optional<Car> car = carRepository.findById(carId);
        if(car.isEmpty()) {
            return null;
        }
        Car currentCar = car.get();

        try {
            Arrays.asList(multipartFiles).forEach(multipartFile -> {
                try {
                    int numberOfImages = imageRepository.findAll().size();
                    String fileName = StringUtils.cleanPath(Objects.requireNonNull(multipartFile.getOriginalFilename()));
                    int p = fileName.lastIndexOf('.');
                    String extension = fileName.substring(p);
                    fileName = fileName.substring(0, p) + "_" + (numberOfImages + 1) + extension;

                    Files.copy(multipartFile.getInputStream(), Path.of("C:\\Users\\vulpo\\Desktop\\Facultate\\Licenta\\Anul 3\\ExclusiveCars\\exclusiveCars\\app\\public\\assets\\images\\" + fileName));

                    Image image = Image.builder()
                            .name(fileName)
                            .type(multipartFile.getContentType())
                            .data(multipartFile.getBytes())
                            .car(currentCar)
                            .build();
                    currentCar.getImages().add(image);
                    imageRepository.save(image);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });

            return new ResponseEntity<>("Imaginile au fost încărcate cu succes!", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("A apărut o eroare la încărcarea imaginilor!", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

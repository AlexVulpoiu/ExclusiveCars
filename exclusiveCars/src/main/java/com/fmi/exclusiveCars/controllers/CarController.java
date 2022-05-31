package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.CarDto;
import com.fmi.exclusiveCars.model.Car;
import com.fmi.exclusiveCars.services.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    private final CarService carService;

    @Autowired
    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping("/add")
    public Car addCar(@Valid @RequestBody CarDto carDto) {
        return carService.addCar(carDto);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editCar(@PathVariable Long id, @Valid @RequestBody CarDto editCar) {
        return carService.editCar(id, editCar);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        return carService.delete(id);
    }
}

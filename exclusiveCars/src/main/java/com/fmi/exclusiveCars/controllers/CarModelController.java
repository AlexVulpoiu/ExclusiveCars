package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.services.CarModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/carModels")
public class CarModelController {

    private final CarModelService carModelService;

    @Autowired
    public CarModelController(CarModelService carModelService) {
        this.carModelService = carModelService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCarModels() {
        return carModelService.addCarModels();
    }
}

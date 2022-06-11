package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.services.CarModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/carModels")
public class CarModelController {

    private final CarModelService carModelService;

    @Autowired
    public CarModelController(CarModelService carModelService) {
        this.carModelService = carModelService;
    }

    @GetMapping("")
    public ResponseEntity<?> getCarModels() {
        return carModelService.getCarModels();
    }

    @GetMapping("/brands")
    public ResponseEntity<?> getCarBrands() {
        return carModelService.getCarBrands();
    }

    @GetMapping("/models")
    public ResponseEntity<?> getCarModelsByBrand() {
        return carModelService.getCarModelsByBrand();
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCarCategoriesByBrandAndModel() {
        return carModelService.getCarCategoriesByBrandAndModel();
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addCarModels() {
        return carModelService.addCarModels();
    }
}

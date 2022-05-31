package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.CarDto;
import com.fmi.exclusiveCars.model.Car;
import com.fmi.exclusiveCars.model.CarModel;
import com.fmi.exclusiveCars.repository.CarModelRepository;
import com.fmi.exclusiveCars.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CarService {

    private final CarRepository carRepository;

    private final CarModelRepository carModelRepository;

    @Autowired
    public CarService(CarRepository carRepository, CarModelRepository carModelRepository) {
        this.carRepository = carRepository;
        this.carModelRepository = carModelRepository;
    }

    public ResponseEntity<?> addCar(CarDto carDto) {

        Optional<CarModel> carModel = carModelRepository.findById(carDto.getCarModelId());
        if(carModel.isEmpty()) {
            return new ResponseEntity<>("This car model doesn't exist!", HttpStatus.NOT_FOUND);
        }

        CarModel currentCarModel = carModel.get();
        Car car = Car.builder()
                .price(carDto.getPrice())
                .color(carDto.getColor())
                .year(carDto.getYear())
                .kilometers(carDto.getKilometers())
                .engine(carDto.getEngine())
                .power(carDto.getPower())
                .transmission(carDto.getTransmission())
                .fuelType(carDto.getFuelType())
                .consumption(carDto.getConsumption())
                .seats(carDto.getSeats())
                .ac(carDto.getAc())
                .airbag(carDto.getAirbag())
                .emissionStandard(carDto.getEmissionStandard())
                .rating(0.0)
                .model(currentCarModel)
                .build();
        carRepository.save(car);

        return new ResponseEntity<>("The car was added successfully!", HttpStatus.OK);
    }

    public ResponseEntity<?> editCar(Long id, CarDto editCar) {

        Optional<Car> car = carRepository.findById(id);
        if(car.isEmpty()) {
            return new ResponseEntity<>("The car you requested doesn't exist!", HttpStatus.NOT_FOUND);
        }

        Optional<CarModel> carModel = carModelRepository.findById(editCar.getCarModelId());
        if(carModel.isEmpty()) {
            return new ResponseEntity<>("This car model doesn't exist!", HttpStatus.NOT_FOUND);
        }

        CarModel newCarModel = carModel.get();
        Car currentCar = car.get();

        currentCar.setPrice(editCar.getPrice());
        currentCar.setColor(editCar.getColor());
        currentCar.setYear(editCar.getYear());
        currentCar.setKilometers(editCar.getKilometers());
        currentCar.setEngine(editCar.getEngine());
        currentCar.setPower(editCar.getPower());
        currentCar.setTransmission(editCar.getTransmission());
        currentCar.setFuelType(editCar.getFuelType());
        currentCar.setConsumption(editCar.getConsumption());
        currentCar.setSeats(editCar.getSeats());
        currentCar.setAc(editCar.getAc());
        currentCar.setAirbag(editCar.getAirbag());
        currentCar.setEmissionStandard(editCar.getEmissionStandard());
        currentCar.setModel(newCarModel);
        carRepository.save(currentCar);

        return new ResponseEntity<>("The car was edited successfully!", HttpStatus.OK);
    }

    public ResponseEntity<?> delete(Long id) {

        Optional<Car> car = carRepository.findById(id);
        if(car.isEmpty()) {
            return new ResponseEntity<>("The car you requested to delete doesn't exist!", HttpStatus.NOT_FOUND);
        }

        Car currentCar = car.get();
        carRepository.delete(currentCar);

        return new ResponseEntity<>("The car was successfully deleted!", HttpStatus.OK);
    }
}

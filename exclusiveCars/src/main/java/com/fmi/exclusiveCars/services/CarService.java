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

    public Car addCar(CarDto carDto) {

        Optional<CarModel> carModel = carModelRepository.findById(carDto.getCarModelId());
        if(carModel.isEmpty()) {
            return null;
        }

        CarModel currentCarModel = carModel.get();
        Car car = Car.builder()
                .price(carDto.getPrice())
                .negotiable(carDto.getNegotiable())
                .color(carDto.getColor())
                .year(carDto.getYear())
                .country(carDto.getCountry())
                .location(carDto.getLocation())
                .kilometers(carDto.getKilometers())
                .engine(carDto.getEngine())
                .power(carDto.getPower())
                .gearbox(carDto.getGearbox())
                .gears(carDto.getGears())
                .transmission(carDto.getTransmission())
                .fuelType(carDto.getFuelType())
                .consumption(carDto.getConsumption())
                .seats(carDto.getSeats())
                .ac(carDto.getAc())
                .airbags(carDto.getAirbags())
                .emissionStandard(carDto.getEmissionStandard())
                .model(currentCarModel)
                .build();

        return carRepository.save(car);
    }

    public ResponseEntity<?> editCar(Long id, CarDto editCar) {

        Optional<Car> car = carRepository.findById(id);
        if(car.isEmpty()) {
            return new ResponseEntity<>("Acest autovehicul nu există!", HttpStatus.NOT_FOUND);
        }

        Optional<CarModel> carModel = carModelRepository.findById(editCar.getCarModelId());
        if(carModel.isEmpty()) {
            return new ResponseEntity<>("Acest model de autovehicul nu există!", HttpStatus.NOT_FOUND);
        }

        CarModel newCarModel = carModel.get();
        Car currentCar = car.get();

        currentCar.setPrice(editCar.getPrice());
        currentCar.setNegotiable(editCar.getNegotiable());
        currentCar.setColor(editCar.getColor());
        currentCar.setYear(editCar.getYear());
        currentCar.setCountry(editCar.getCountry());
        currentCar.setLocation(editCar.getLocation());
        currentCar.setKilometers(editCar.getKilometers());
        currentCar.setEngine(editCar.getEngine());
        currentCar.setPower(editCar.getPower());
        currentCar.setGearbox(editCar.getGearbox());
        currentCar.setGears(editCar.getGears());
        currentCar.setTransmission(editCar.getTransmission());
        currentCar.setFuelType(editCar.getFuelType());
        currentCar.setConsumption(editCar.getConsumption());
        currentCar.setSeats(editCar.getSeats());
        currentCar.setAc(editCar.getAc());
        currentCar.setAirbags(editCar.getAirbags());
        currentCar.setEmissionStandard(editCar.getEmissionStandard());
        currentCar.setModel(newCarModel);
        carRepository.save(currentCar);

        return new ResponseEntity<>("Autovehiculul a fost editat cu succes!", HttpStatus.OK);
    }

    public ResponseEntity<?> delete(Long id) {

        Optional<Car> car = carRepository.findById(id);
        if(car.isEmpty()) {
            return new ResponseEntity<>("Acest autovehicul nu există!", HttpStatus.NOT_FOUND);
        }

        Car currentCar = car.get();
        carRepository.delete(currentCar);

        return new ResponseEntity<>("Autovehiculul a fost editat cu succes!", HttpStatus.OK);
    }
}

package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.RentCar;
import com.fmi.exclusiveCars.model.RentCarId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentCarRepository extends JpaRepository<RentCar, RentCarId> {

}

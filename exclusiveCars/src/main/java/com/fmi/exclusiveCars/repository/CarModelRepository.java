package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.CarModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarModelRepository extends JpaRepository<CarModel, Long> {

}

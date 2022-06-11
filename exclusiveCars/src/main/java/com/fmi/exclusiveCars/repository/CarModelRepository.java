package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.CarModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarModelRepository extends JpaRepository<CarModel, Long> {

    @Query("SELECT DISTINCT manufacturer FROM CarModel")
    List<String> getCarBrands();

    @Query("SELECT manufacturer, model FROM CarModel GROUP BY manufacturer, model")
    List<String> getCarModelsByBrand();

    @Query("SELECT manufacturer, model, category FROM CarModel")
    List<String> getCarCategoriesByBrandAndModel();
}

package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.CarModel;
import com.fmi.exclusiveCars.model.ECategory;
import com.fmi.exclusiveCars.repository.CarModelRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class CarModelService {

    private final CarModelRepository carModelRepository;

    @Autowired
    public CarModelService(CarModelRepository carModelRepository) {
        this.carModelRepository = carModelRepository;
    }

    public ResponseEntity<?> getCarModels() {
        List<CarModel> carModels = carModelRepository.findAll();
        return new ResponseEntity<>(carModels, HttpStatus.OK);
    }

    public ResponseEntity<?> getCarBrands() {
        List<String> carBrands = carModelRepository.getCarBrands();
        return new ResponseEntity<>(carBrands, HttpStatus.OK);
    }

    public ResponseEntity<?> getCarModelsByBrand() {
        List<String> carModelsByBrand = carModelRepository.getCarModelsByBrand();
        HashMap<String, List<String>> carModelsByBrandDict = new HashMap<>();

        for(String carModelByBrand: carModelsByBrand) {

            String car = carModelByBrand.split(",")[0];
            String model = carModelByBrand.split(",")[1];

            if(carModelsByBrandDict.containsKey(car)) {
                List<String> models = carModelsByBrandDict.get(car);
                models.add(model);
                carModelsByBrandDict.put(car, models);
            } else {
                List<String> models = new ArrayList<>();
                models.add(model);
                carModelsByBrandDict.put(car, models);
            }
        }

        return new ResponseEntity<>(carModelsByBrandDict, HttpStatus.OK);
    }

    public ResponseEntity<?> getCarCategoriesByBrandAndModel() {
        List<String> carModels = carModelRepository.getCarCategoriesByBrandAndModel();
        HashMap<String, List<ECategory>> carCategoriesByBrandAndModel = new HashMap<>();

        for(String carCategoryByBrandAndModel: carModels) {

            String car = carCategoryByBrandAndModel.split(",")[0];
            String model = carCategoryByBrandAndModel.split(",")[1];
            String category = carCategoryByBrandAndModel.split(",")[2];
            String key = car + "_" + model;

            if(carCategoriesByBrandAndModel.containsKey(key)) {
                List<ECategory> categories = carCategoriesByBrandAndModel.get(key);
                categories.add(ECategory.valueOf(category));
                carCategoriesByBrandAndModel.put(key, categories);
            } else {
                List<ECategory> categories = new ArrayList<>();
                categories.add(ECategory.valueOf(category));
                carCategoriesByBrandAndModel.put(key, categories);
            }
        }

        return new ResponseEntity<>(carCategoriesByBrandAndModel, HttpStatus.OK);
    }

    public ResponseEntity<?> addCarModels() {

        List<CarModel> carModels = carModelRepository.findAll();
        if(!carModels.isEmpty()) {
            return new ResponseEntity<>("Modele de mașini au fost deja adăugate în baza de date!", HttpStatus.OK);
        }

        try {

            URL url = new URL("https://parseapi.back4app.com/classes/Carmodels_Car_Model_List?limit=10000&order=Make,Model,Category&excludeKeys=Year");
            HttpURLConnection urlConnection = (HttpURLConnection)url.openConnection();
            urlConnection.setRequestProperty("X-Parse-Application-Id", "e7GeDxPJoiPLETgUoWvi1KmFlyHIbx801fJg6LAw"); // This is your app's application id
            urlConnection.setRequestProperty("X-Parse-REST-API-Key", "dLbjU4z9QsvRfov1BQ8l7H6KHgFkuO6JscF0CFOD"); // This is your app's REST API key

            try {

                BufferedReader reader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
                StringBuilder stringBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    stringBuilder.append(line);
                }

                JSONObject data = new JSONObject(stringBuilder.toString());
                JSONArray results = data.getJSONArray("results");

                FileWriter file = new FileWriter("C:\\Users\\vulpo\\Desktop\\Facultate\\Licenta\\Anul 3\\ExclusiveCars\\exclusiveCars\\src\\main\\java\\com\\fmi\\exclusiveCars\\fetch_data\\cars.json");
                file.write(data.toString(4));
                file.close();
                boolean first = true;
                CarModel previousCarModel = null;
                for(Object object: results) {

                    if(object instanceof JSONObject) {

                        String manufacturer = ((JSONObject) object).getString("Make");
                        String model = ((JSONObject) object).getString("Model");
                        String category = ((JSONObject) object).getString("Category");
                        category = category.split("[,/]")[0].trim().toUpperCase().replaceAll("[^A-Z]+", "");

                        CarModel carModel = CarModel.builder()
                                .manufacturer(manufacturer)
                                .model(model)
                                .category(ECategory.valueOf(category))
                                .build();

                        if(first || !carModel.equals(previousCarModel)) {
                            carModelRepository.save(carModel);
                        }
                        previousCarModel = carModel;
                    }
                    first = false;
                }

                for(ECategory eCategory: ECategory.values()) {
                    CarModel carModel = CarModel.builder()
                            .manufacturer("Other")
                            .model("Other")
                            .category(eCategory)
                            .build();
                    carModelRepository.save(carModel);
                }
                return new ResponseEntity<>("Modelele de mașini au fost adăugate cu succes!", HttpStatus.OK);

            } finally {
                urlConnection.disconnect();
            }
        } catch (Exception e) {
            System.out.println("Error: " + e);
            return new ResponseEntity<>("A a apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
        }
    }
}

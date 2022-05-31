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
import java.util.List;

@Service
public class CarModelService {

    private final CarModelRepository carModelRepository;

    @Autowired
    public CarModelService(CarModelRepository carModelRepository) {
        this.carModelRepository = carModelRepository;
    }

    public ResponseEntity<?> addCarModels() {

        List<CarModel> carModels = carModelRepository.findAll();
        if(!carModels.isEmpty()) {
            return new ResponseEntity<>("The car models were already added to database!", HttpStatus.OK);
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
                return new ResponseEntity<>("Car models added successfully!", HttpStatus.OK);

            } finally {
                urlConnection.disconnect();
            }
        } catch (Exception e) {
            System.out.println("Error: " + e);
            return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
        }
    }
}

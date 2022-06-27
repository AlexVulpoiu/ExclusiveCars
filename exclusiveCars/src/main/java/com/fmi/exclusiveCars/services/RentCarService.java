package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.model.*;
import com.fmi.exclusiveCars.repository.CarRepository;
import com.fmi.exclusiveCars.repository.RentCarRepository;
import com.fmi.exclusiveCars.repository.RentalAnnouncementRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class RentCarService {

    private final RentCarRepository rentCarRepository;

    private final CarRepository carRepository;

    private final UserRepository userRepository;

    private final RentalAnnouncementRepository rentalAnnouncementRepository;

    private final JavaMailSender javaMailSender;

    @Autowired
    public RentCarService(RentCarRepository rentCarRepository, CarRepository carRepository, UserRepository userRepository, RentalAnnouncementRepository rentalAnnouncementRepository, JavaMailSender javaMailSender) {
        this.rentCarRepository = rentCarRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.rentalAnnouncementRepository = rentalAnnouncementRepository;
        this.javaMailSender = javaMailSender;
    }

    public ResponseEntity<?> getRentalsForCar(Long id) {

        Optional<Car> car = carRepository.findById(id);
        if(car.isEmpty()) {
            return new ResponseEntity<>("Acest automobil nu există!", HttpStatus.NOT_FOUND);
        }

        Car currentCar = car.get();
        return new ResponseEntity<>(currentCar.getRentalClients(), HttpStatus.OK);
    }

    public ResponseEntity<?> getMyRentals() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if (currentUser.getRoles().size() != 1) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            return new ResponseEntity<>(currentUser.getCars(), HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getMyRentalRequests() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if (currentUser.getOrganisation() == null) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }
            Organisation organisation = currentUser.getOrganisation();
            Set<RentalCenter> rentalCenters = organisation.getRentalCenters();

            List<RentalAnnouncement> rentalAnnouncements = new ArrayList<>();
            for(RentalCenter rentalCenter: rentalCenters) {
                rentalAnnouncements.addAll(rentalCenter.getRentalAnnouncements());
            }

            Set<Car> cars = new HashSet<>();
            for(RentalAnnouncement rentalAnnouncement: rentalAnnouncements) {
                cars.add(rentalAnnouncement.getCar());
            }

            List<RentCar> rentalRequests = new ArrayList<>();
            for(Car car: cars) {
                rentalRequests.addAll(car.getRentalClients());
            }

            return new ResponseEntity<>(rentalRequests, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> rentCar(Long carId, String startDate, String endDate, Long announcementId) throws MessagingException, UnsupportedEncodingException {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if (currentUser.getRoles().size() != 1) {
                return new ResponseEntity<>("Nu poți efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            Optional<Car> car = carRepository.findById(carId);
            if (car.isEmpty()) {
                return new ResponseEntity<>("Acest autovehicul nu există!", HttpStatus.NOT_FOUND);
            }

            Optional<RentalAnnouncement> rentalAnnouncement = rentalAnnouncementRepository.findById(announcementId);
            if(rentalAnnouncement.isEmpty()) {
                return new ResponseEntity<>("Acest centru de închirieri nu există!", HttpStatus.NOT_FOUND);
            }
            RentalAnnouncement announcement = rentalAnnouncement.get();
            RentalCenter rentalCenter = announcement.getRentalCenter();

            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            RentCarId rentCarId = RentCarId.builder()
                    .carId(carId)
                    .userId(currentUser.getId())
                    .startDate(start)
                    .build();

            RentCar rentCar = RentCar.builder()
                    .id(rentCarId)
                    .endDate(end)
                    .user(currentUser)
                    .car(car.get())
                    .build();

            rentCarRepository.save(rentCar);
            currentUser.addRentCar(rentCar);

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy");

            long days = start.until(end, ChronoUnit.DAYS) + 1;
            String toAddress = currentUser.getEmail();
            String subject = "Confirmare cerere de închiriere";
            String message = "Acesta este un mesaj de confirmare a cererii tale de închiriere.<br><br>"
                    + "Detalii: <br>"
                    + "- perioadă: " + start.format(dtf) + " -> " + end.format(dtf) + "<br>"
                    + "- preț total: " + car.get().getPrice() + " * " + days + " = " + car.get().getPrice() * days + " €<br>"
                    + "- locație: " + rentalCenter.getName() + ", " + rentalCenter.getCity() + ", " + rentalCenter.getAddress() + "<br>"
                    + "- link locație: <a href=\"http://localhost:8082/rentalCenters/" + rentalCenter.getId() +  "\">" + rentalCenter.getName() + "</a><br>"
                    + "- link anunț: <a href=\"http://localhost:8082/rentalAnnouncements/" + announcementId +  "\">anunț</a><br>"
                    + "- email: " + rentalCenter.getEmail() + "<br>"
                    + "- telefon: " + rentalCenter.getPhone() + "<br><br>"
                    + "Te așteptăm în data de " + start.format(dtf) + ", la sediul nostru, pentru a intra în posesia autovehiculului!<br><br><br>"
                    + "Îți mulțumim și îți urăm o zi bună!<br>Echipa ExclusiveCars";
            sendMail(toAddress, subject, message);

            return new ResponseEntity<>("Cererea a fost înregistrată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> cancelRentCar(String id) throws MessagingException, UnsupportedEncodingException {

        String[] ids = id.split("_");
        Long userId = Long.parseLong(ids[0]);
        Long carId = Long.parseLong(ids[1]);
        LocalDate date = LocalDate.parse(ids[2]);

        RentCarId rentCarId = RentCarId.builder()
                .userId(userId)
                .carId(carId)
                .startDate(date)
                .build();

        Optional<RentCar> rentCar = rentCarRepository.findById(rentCarId);
        if(rentCar.isEmpty()) {
            return new ResponseEntity<>("Această închiriere nu există!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            RentCar rental = rentCar.get();
            if(rental.getUser() == currentUser) {
                currentUser.removeRentCar(rental);
                rentCarRepository.delete(rental);
                return new ResponseEntity<>("Cererea de închiriere a fost anulată cu succes!", HttpStatus.OK);
            }

            Optional<RentalAnnouncement> optionalRentalAnnouncement = rentalAnnouncementRepository.findByCar(carId);
            if(optionalRentalAnnouncement.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            RentalAnnouncement rentalAnnouncement = optionalRentalAnnouncement.get();
            if(rentalAnnouncement.getRentalCenter().getOrganisation().getOwner() != currentUser) {
                return new ResponseEntity<>("Nu ai permisiunea de a efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            Optional<User> client = userRepository.findById(userId);
            if(client.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            Car car = rentalAnnouncement.getCar();
            RentalCenter rentalCenter = rentalAnnouncement.getRentalCenter();
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy");

            LocalDate start = rental.getId().getStartDate();
            LocalDate end = rental.getEndDate();
            long days = start.until(end, ChronoUnit.DAYS) + 1;
            String toAddress = currentUser.getEmail();
            String subject = "Confirmare cerere de închiriere";
            String message = "Acesta este un mesaj de confirmare a cererii tale de închiriere.<br><br>"
                    + "Detalii: <br>"
                    + "- perioadă: " + start.format(dtf) + " -> " + end.format(dtf) + "<br>"
                    + "- preț total: " + car.getPrice() + " * " + days + " = " + car.getPrice() * days + " €<br>"
                    + "- locație: " + rentalCenter.getName() + ", " + rentalCenter.getCity() + ", " + rentalCenter.getAddress() + "<br>"
                    + "- link locație: <a href=\"http://localhost:8082/rentalCenters/" + rentalCenter.getId() +  "\">" + rentalCenter.getName() + "</a><br>"
                    + "- link anunț: <a href=\"http://localhost:8082/rentalAnnouncements/" + rentalAnnouncement.getId() +  "\">anunț</a><br>"
                    + "- email: " + rentalCenter.getEmail() + "<br>"
                    + "- telefon: " + rentalCenter.getPhone() + "<br><br>"
                    + "Te așteptăm în data de " + start.format(dtf) + ", la sediul nostru, pentru a intra în posesia autovehiculului!<br><br><br>"
                    + "Îți mulțumim și îți urăm o zi bună!<br>Echipa ExclusiveCars";
            sendMail(toAddress, subject, message);

            User customer = client.get();
            customer.removeRentCar(rental);
            rentCarRepository.delete(rental);

            return new ResponseEntity<>("Cererea de închiriere a fost anulată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    private void sendMail(String toAddress, String subject, String message)
            throws MessagingException, UnsupportedEncodingException {

        String fromAddress = "exclusivecars22@outlook.com";
        String senderName = "Exclusive Cars";

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        helper.setText(message, true);
        javaMailSender.send(mimeMessage);
    }
}

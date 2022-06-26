package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.*;
import com.fmi.exclusiveCars.model.*;
import com.fmi.exclusiveCars.repository.OrganisationRepository;
import com.fmi.exclusiveCars.repository.RoleRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class OrganisationService {

    private final OrganisationRepository organisationRepository;

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    @Autowired
    public OrganisationService(OrganisationRepository organisationRepository, UserRepository userRepository, RoleRepository roleRepository) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public ResponseEntity<?> getAllOrganisations() {

        Collection<Organisation> organisations = organisationRepository.findAll();
        if(organisations.isEmpty()) {
            return new ResponseEntity<>("Momentan nu există nicio organizație!", HttpStatus.OK);
        }

        List<OrganisationResponseDto> organisationList = new ArrayList<>();
        for(Organisation organisation: organisations) {

            List<AutoServiceResponseDto> autoServiceList = new ArrayList<>();
            for(AutoService autoService: organisation.getAutoServices()) {
                autoServiceList.add(mapAutoServiceToAutoServiceResponseDto(autoService));
            }

            List<RentalCenterResponseDto> rentalCenterList = new ArrayList<>();
            for(RentalCenter rentalCenter: organisation.getRentalCenters()) {
                rentalCenterList.add(mapRentalCenterToRentalCenterResponseDto(rentalCenter));
            }

            OrganisationResponseDto organisationResponseDto = OrganisationResponseDto.builder()
                    .id(organisation.getId())
                    .name(organisation.getName())
                    .owner(organisation.getOwner().getFirstName() + " " + organisation.getOwner().getLastName())
                    .ownerId(organisation.getOwner().getId())
                    .autoServices(autoServiceList)
                    .rentalCenters(rentalCenterList)
                    .build();
            organisationList.add(organisationResponseDto);
        }
        return new ResponseEntity<>(organisationList, HttpStatus.OK);
    }

    public ResponseEntity<?> getOrganisation(Long id) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl)principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            Optional<Organisation> organisation = organisationRepository.findById(id);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("Această organizație nu există!", HttpStatus.NOT_FOUND);
            }
            if(user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            if(!userHasRole(user.get(), ERole.ROLE_ADMIN)
                    && !userHasRole(user.get(), ERole.ROLE_MODERATOR)
                    && !organisation.get().getOwner().equals(user.get())) {
                return new ResponseEntity<>("Nu ai permisiunea de a accesa această pagină!", HttpStatus.FORBIDDEN);
            }

            Organisation currentOrganisation = organisation.get();

            List<AutoServiceResponseDto> autoServiceList = new ArrayList<>();
            for(AutoService autoService: currentOrganisation.getAutoServices()) {
                autoServiceList.add(mapAutoServiceToAutoServiceResponseDto(autoService));
            }

            List<RentalCenterResponseDto> rentalCenterList = new ArrayList<>();
            for(RentalCenter rentalCenter: currentOrganisation.getRentalCenters()) {
                rentalCenterList.add(mapRentalCenterToRentalCenterResponseDto(rentalCenter));
            }

            OrganisationResponseDto organisationResponseDto = OrganisationResponseDto.builder()
                    .id(currentOrganisation.getId())
                    .name(currentOrganisation.getName())
                    .owner(currentOrganisation.getOwner().getFirstName() + " " + currentOrganisation.getOwner().getLastName())
                    .ownerId(currentOrganisation.getOwner().getId())
                    .autoServices(autoServiceList)
                    .rentalCenters(rentalCenterList)
                    .build();

            return new ResponseEntity<>(organisationResponseDto, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getMyOrganisation() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            Organisation organisation = user.get().getOrganisation();

            List<AutoServiceResponseDto> autoServiceList = new ArrayList<>();
            for(AutoService autoService: organisation.getAutoServices()) {
                autoServiceList.add(mapAutoServiceToAutoServiceResponseDto(autoService));
            }

            List<RentalCenterResponseDto> rentalCenterList = new ArrayList<>();
            for(RentalCenter rentalCenter: organisation.getRentalCenters()) {
                rentalCenterList.add(mapRentalCenterToRentalCenterResponseDto(rentalCenter));
            }

            OrganisationResponseDto organisationResponseDto = OrganisationResponseDto.builder()
                    .id(organisation.getId())
                    .name(organisation.getName())
                    .owner(organisation.getOwner().getFirstName() + " " + organisation.getOwner().getLastName())
                    .ownerId(organisation.getOwner().getId())
                    .autoServices(autoServiceList)
                    .rentalCenters(rentalCenterList)
                    .build();

            return new ResponseEntity<>(organisationResponseDto, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getMyStats() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if(user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            Organisation organisation = user.get().getOrganisation();

            // statistici service-uri
            long totalServiceAppointments = 0;
            long lastMonthServiceAppointments = 0;
            String mostVisitedAutoService = "";
            long mostVisitedAutoServiceId = 0;
            long maxVisits = -1;
            long mostVisitedTotalAppointments = 0;
            long mostVisitedLastMonthAppointments = 0;
            LocalDate today = LocalDate.now();
            HashMap<String, Long> autoServicesByCity = new HashMap<>();

            Set<AutoService> autoServices = organisation.getAutoServices();
            for(AutoService autoService: autoServices) {
                List<ServiceAppointment> serviceAppointments = autoService.getUsers();
                long visits = serviceAppointments.size();
                totalServiceAppointments += visits;

                long lastMonthVisits = 0;
                for(ServiceAppointment serviceAppointment: serviceAppointments) {
                    LocalDate date = serviceAppointment.getId().getDate();
                    if(date.isBefore(today) && today.minusDays(30).isBefore(date)) {
                        lastMonthVisits++;
                    }
                }
                lastMonthServiceAppointments += lastMonthVisits;

                if(visits > maxVisits) {
                    maxVisits = visits;
                    mostVisitedTotalAppointments = visits;
                    mostVisitedLastMonthAppointments = lastMonthVisits;
                    mostVisitedAutoService = autoService.getName();
                    mostVisitedAutoServiceId = autoService.getId();
                }

                String city = autoService.getCity();
                if(autoServicesByCity.containsKey(city)) {
                    long autoServicesPerCity = autoServicesByCity.get(city);
                    autoServicesByCity.put(city, autoServicesPerCity + 1);
                } else {
                    autoServicesByCity.put(city, 1L);
                }
            }

            // statistici inchirieri
            long totalCarRentals = 0;
            long lastMonthCarRentals = 0;
            String mostProfitableCar = "";
            long mostProfitableCarAnnouncementId = -1;
            long mostProfitableCarProfit = 0;
            long maxProfit = -1;
            String mostRentedCar = "";
            long mostRentedCarAnnouncementId = -1;
            long maxRentals = -1;
            long mostRentedCarTotalRentals = 0;
            long mostRentedCarLastMonthRentals = 0;
            long mostRentedCarProfit = 0;
            HashMap<String, Long> rentalCentersByCity = new HashMap<>();
            HashMap<String, Long> rentalsByBrand = new HashMap<>();

            Set<RentalCenter> rentalCenters = organisation.getRentalCenters();
            List<RentalAnnouncement> rentalAnnouncements = new ArrayList<>();
            for(RentalCenter rentalCenter: rentalCenters) {
                rentalAnnouncements.addAll(rentalCenter.getRentalAnnouncements());

                String city = rentalCenter.getCity();
                if(rentalCentersByCity.containsKey(city)) {
                    long rentalCentersPerCity = rentalCentersByCity.get(city);
                    rentalCentersByCity.put(city, rentalCentersPerCity + 1);
                } else {
                    rentalCentersByCity.put(city, 1L);
                }
            }

            for(RentalAnnouncement rentalAnnouncement: rentalAnnouncements) {
                Car car = rentalAnnouncement.getCar();
                String brand = car.getModel().getManufacturer();
                if(rentalsByBrand.containsKey(brand)) {
                    long rentalsPerBrand = rentalsByBrand.get(brand);
                    rentalsByBrand.put(brand, rentalsPerBrand + 1);
                } else {
                    rentalsByBrand.put(brand, 1L);
                }

                List<RentCar> rentals = car.getRentalClients();
                long announcementRentals = rentals.size();
                totalCarRentals += announcementRentals;

                long lastMonthRentals = 0;
                long profit = 0;
                for(RentCar rental: rentals) {
                    LocalDate startDate = rental.getId().getStartDate();
                    if(startDate.isBefore(today) && today.minusDays(30).isBefore(startDate)) {
                        lastMonthRentals++;
                    }

                    LocalDate endDate = rental.getEndDate();
                    profit += (long) car.getPrice() * (startDate.until(endDate).getDays() + 1);
                }
                lastMonthCarRentals += lastMonthRentals;

                if(profit > maxProfit) {
                    maxProfit = profit;
                    mostProfitableCarProfit = profit;
                    mostProfitableCar = car.getModel().getManufacturer() + " " + car.getModel().getModel() + " "
                            + car.getModel().getCategory() + ", " + car.getYear();
                    mostProfitableCarAnnouncementId = rentalAnnouncement.getId();
                }

                if(announcementRentals > maxRentals) {
                    maxRentals = announcementRentals;
                    mostRentedCarTotalRentals = announcementRentals;
                    mostRentedCarLastMonthRentals = lastMonthRentals;
                    mostRentedCarProfit = profit;
                    mostRentedCar = car.getModel().getManufacturer() + " " + car.getModel().getModel() + " "
                            + car.getModel().getCategory() + ", " + car.getYear();
                    mostRentedCarAnnouncementId = rentalAnnouncement.getId();
                }
            }

            OrganisationStatsDto organisationStatsDto = OrganisationStatsDto.builder()
                    .organisationName(organisation.getName())
                    .totalServiceAppointments(totalServiceAppointments)
                    .lastMonthServiceAppointments(lastMonthServiceAppointments)
                    .mostVisitedAutoService(mostVisitedAutoService)
                    .mostVisitedAutoServiceId(mostVisitedAutoServiceId)
                    .mostVisitedAutoServiceTotalAppointments(mostVisitedTotalAppointments)
                    .mostVisitedAutoServiceLastMonthAppointments(mostVisitedLastMonthAppointments)
                    .autoServicesByCity(autoServicesByCity)
                    .totalCarRentals(totalCarRentals)
                    .lastMonthCarRentals(lastMonthCarRentals)
                    .mostProfitableCar(mostProfitableCar)
                    .mostProfitableCarAnnouncementId(mostProfitableCarAnnouncementId)
                    .mostProfitableCarProfit(mostProfitableCarProfit)
                    .mostRentedCar(mostRentedCar)
                    .mostRentedCarAnnouncementId(mostRentedCarAnnouncementId)
                    .mostRentedCarTotalRentals(mostRentedCarTotalRentals)
                    .mostRentedCarLastMonthRentals(mostRentedCarLastMonthRentals)
                    .mostRentedCarProfit(mostRentedCarProfit)
                    .carRentalsByBrand(rentalsByBrand)
                    .rentalCentersByCity(rentalCentersByCity)
                    .build();

            return new ResponseEntity<>(organisationStatsDto, HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> addOrganisation(OrganisationDto organisationDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if(user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            if(user.get().getOrganisation() != null) {
                return new ResponseEntity<>("Poți deține o singură organizație!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            Optional<Organisation> organisation = organisationRepository.findByName(organisationDto.getName());
            if(organisation.isPresent()) {
                return new ResponseEntity<>("Acest nume este deținut deja de altă organizație!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            addOrganisationRole(currentUser);
            Organisation newOrganisation = Organisation.builder()
                    .name(organisationDto.getName())
                    .owner(currentUser)
                    .build();
            currentUser.setOrganisation(newOrganisation);
            userRepository.save(currentUser);

            return new ResponseEntity<>("Organizația a fost adăugată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> editOrganisation(OrganisationDto organisationDto) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            if(currentUser.getOrganisation() == null) {
                return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.BAD_REQUEST);
            }

            Long organisationId = currentUser.getOrganisation().getId();
            Optional<Organisation> organisation = organisationRepository.findById(organisationId);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.BAD_REQUEST);
            }

            Optional<Organisation> organisationByName = organisationRepository.findByName(organisationDto.getName());
            if(organisationByName.isPresent() && !organisation.get().equals(organisationByName.get())) {
                return new ResponseEntity<>("Acest nume este deținut deja de altă organizație!", HttpStatus.BAD_REQUEST);
            }

            Organisation currentOrganisation = organisation.get();
            currentOrganisation.setName(organisationDto.getName());
            organisationRepository.save(currentOrganisation);

            return new ResponseEntity<>("Organizația a fost editată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteOrganisation(Long id) {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
            }

            Optional<Organisation> organisation = organisationRepository.findById(id);
            if(organisation.isEmpty()) {
                return new ResponseEntity<>("Această rganizație nu există!", HttpStatus.NOT_FOUND);
            }

            Organisation currentOrganisation = organisation.get();
            User currentUser = user.get();
            if(userHasRole(currentUser, ERole.ROLE_ADMIN) || userHasRole(currentUser, ERole.ROLE_MODERATOR)
                || currentOrganisation.getOwner().equals(currentUser)) {

                User owner = currentOrganisation.getOwner();
                owner.setOrganisation(null);
                removeOrganisationRole(owner);
                userRepository.save(owner);

                currentOrganisation.setOwner(null);
                organisationRepository.delete(currentOrganisation);

                return new ResponseEntity<>("Organizația a fost ștearsă cu succes!", HttpStatus.OK);
            }

            return new ResponseEntity<>("Nu ai permisiunea de a efectua această operație!", HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou.", HttpStatus.BAD_REQUEST);
    }

    private boolean userHasRole(User user, ERole role) {

        for(Role r: user.getRoles()) {
            if(r.getName().equals(role)) {
                return true;
            }
        }

        return false;
    }

    private void addOrganisationRole(User user) {

        Optional<Role> organisationRole = roleRepository.findByName(ERole.ROLE_ORGANISATION);
        organisationRole.ifPresent(role -> user.getRoles().add(role));
        userRepository.save(user);
    }

    private void removeOrganisationRole(User user) {

        Optional<Role> organisationRole = roleRepository.findByName(ERole.ROLE_ORGANISATION);
        organisationRole.ifPresent(role -> user.getRoles().remove(role));
        userRepository.save(user);
    }

    private AutoServiceResponseDto mapAutoServiceToAutoServiceResponseDto(AutoService autoService) {
        return AutoServiceResponseDto.builder()
                .id(autoService.getId())
                .name(autoService.getName())
                .city(autoService.getCity())
                .address(autoService.getAddress())
                .numberOfStations(autoService.getNumberOfStations())
                .startHour(autoService.getStartHour())
                .endHour(autoService.getEndHour())
                .email(autoService.getEmail())
                .phone(autoService.getPhone())
                .organisation(autoService.getOrganisation().getName())
                .build();
    }

    private RentalCenterResponseDto mapRentalCenterToRentalCenterResponseDto(RentalCenter rentalCenter) {
        return RentalCenterResponseDto.builder()
                .id(rentalCenter.getId())
                .name(rentalCenter.getName())
                .city(rentalCenter.getCity())
                .address(rentalCenter.getAddress())
                .email(rentalCenter.getEmail())
                .phone(rentalCenter.getPhone())
                .organisation(rentalCenter.getOrganisation().getName())
                .build();
    }
}

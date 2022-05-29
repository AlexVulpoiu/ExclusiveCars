package com.fmi.exclusiveCars.services;

import com.fmi.exclusiveCars.dto.ServiceAppointmentDto;
import com.fmi.exclusiveCars.dto.ServiceAppointmentResponseDto;
import com.fmi.exclusiveCars.model.*;
import com.fmi.exclusiveCars.repository.AutoServiceRepository;
import com.fmi.exclusiveCars.repository.ServiceAppointmentRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceAppointmentService {

    private final ServiceAppointmentRepository serviceAppointmentRepository;

    private final AutoServiceRepository autoServiceRepository;

    private final UserRepository userRepository;

    @Autowired
    public ServiceAppointmentService(ServiceAppointmentRepository serviceAppointmentRepository, AutoServiceRepository autoServiceRepository, UserRepository userRepository) {
        this.serviceAppointmentRepository = serviceAppointmentRepository;
        this.autoServiceRepository = autoServiceRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<?> getMyAppointments() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            List<ServiceAppointment> myAppointments = currentUser.getServices();

            if(myAppointments.isEmpty()) {
                return new ResponseEntity<>("You haven't made any appointment yet!", HttpStatus.OK);
            }

            List<ServiceAppointmentResponseDto> myAppointmentsDtoList = new ArrayList<>();
            for(ServiceAppointment serviceAppointment: myAppointments) {
                ServiceAppointmentResponseDto serviceAppointmentResponseDto = ServiceAppointmentResponseDto.builder()
                        .user(serviceAppointment.getUser().getUsername())
                        .autoService(serviceAppointment.getAutoService().getName())
                        .problemDescription(serviceAppointment.getProblemDescription())
                        .date(serviceAppointment.getId().getDate())
                        .hour(serviceAppointment.getHour())
                        .stationNumber(serviceAppointment.getStationNumber())
                        .build();
                myAppointmentsDtoList.add(serviceAppointmentResponseDto);
            }

            return new ResponseEntity<>(myAppointmentsDtoList, HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getAppointmentsForAutoService(Long autoServiceId) {

        Optional<AutoService> autoService = autoServiceRepository.findById(autoServiceId);
        if(autoService.isEmpty()) {
            return new ResponseEntity<>("The auto service you have requested doesn't exist!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            if (!userHasRole(user.get(), ERole.ROLE_MODERATOR) && !userHasRole(user.get(), ERole.ROLE_ADMIN)
                    && autoService.get().getOrganisation() != user.get().getOrganisation()) {
                return new ResponseEntity<>("You can't access this endpoint!", HttpStatus.FORBIDDEN);
            }

            List<ServiceAppointment> serviceAppointments = autoService.get().getUsers();
            if (serviceAppointments.isEmpty()) {
                return new ResponseEntity<>("There are no appointments for this auto service yet!", HttpStatus.OK);
            }

            List<ServiceAppointmentResponseDto> serviceAppointmentResponseDtos = new ArrayList<>();
            for(ServiceAppointment serviceAppointment: serviceAppointments) {
                ServiceAppointmentResponseDto serviceAppointmentResponseDto = ServiceAppointmentResponseDto.builder()
                        .user(serviceAppointment.getUser().getUsername())
                        .autoService(serviceAppointment.getAutoService().getName())
                        .problemDescription(serviceAppointment.getProblemDescription())
                        .date(serviceAppointment.getId().getDate())
                        .hour(serviceAppointment.getHour())
                        .stationNumber(serviceAppointment.getStationNumber())
                        .build();
                serviceAppointmentResponseDtos.add(serviceAppointmentResponseDto);
            }

            return new ResponseEntity<>(serviceAppointmentResponseDtos, HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> makeAppointmentForAutoService(Long autoServiceId, ServiceAppointmentDto serviceAppointmentDto) {

        Optional<AutoService> autoService = autoServiceRepository.findById(autoServiceId);
        if(autoService.isEmpty()) {
            return new ResponseEntity<>("The auto service you have requested doesn't exist!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();

            if (userHasRole(currentUser, ERole.ROLE_ADMIN) || userHasRole(currentUser, ERole.ROLE_MODERATOR)
                || userHasRole(currentUser, ERole.ROLE_ORGANISATION)) {
                return new ResponseEntity<>("You can't make a service appointment!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            ServiceAppointmentId serviceAppointmentId = ServiceAppointmentId.builder()
                    .serviceId(autoServiceId)
                    .userId(currentUser.getId())
                    .date(serviceAppointmentDto.getDate())
                    .build();
            Optional<ServiceAppointment> serviceAppointment = serviceAppointmentRepository.findById(serviceAppointmentId);

            if(serviceAppointment.isPresent()) {
                return new ResponseEntity<>("You have already made an appointment for today!", HttpStatus.BAD_REQUEST);
            }

            AutoService currentAutoService = autoService.get();
            ServiceAppointment serviceAppointmentToAdd = ServiceAppointment.builder()
                    .id(serviceAppointmentId)
                    .problemDescription(serviceAppointmentDto.getProblemDescription())
                    .hour(serviceAppointmentDto.getHour())
                    .stationNumber(serviceAppointmentDto.getStationNumber())
                    .autoService(currentAutoService)
                    .user(currentUser)
                    .build();
            serviceAppointmentRepository.save(serviceAppointmentToAdd);
            currentUser.addServiceAppointment(currentAutoService, serviceAppointmentToAdd);

            return new ResponseEntity<>("The service appointment was successfully created!", HttpStatus.OK);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> deleteAppointment(String serviceAppointmentId) {

        String[] ids = serviceAppointmentId.split("_");
        Long userId = Long.parseLong(ids[0]);
        Long serviceId = Long.parseLong(ids[1]);
        LocalDate date = LocalDate.parse(ids[2]);
        ServiceAppointmentId id = ServiceAppointmentId.builder()
                .userId(userId)
                .serviceId(serviceId)
                .date(date)
                .build();

        Optional<ServiceAppointment> appointment = serviceAppointmentRepository.findById(id);
        if(appointment.isEmpty()) {
            return new ResponseEntity<>("The auto service you have requested to delete doesn't exist!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            ServiceAppointment serviceAppointment = appointment.get();
            if(serviceAppointment.getUser() == currentUser
                    || serviceAppointment.getAutoService().getOrganisation().getOwner().equals(currentUser)) {

                currentUser.removeServiceAppointment(serviceAppointment);
                serviceAppointmentRepository.delete(serviceAppointment);
                return new ResponseEntity<>("The appointment was successfully deleted!", HttpStatus.OK);
            }

            return new ResponseEntity<>("You are not allowed to perform this operation!", HttpStatus.METHOD_NOT_ALLOWED);
        }

        return new ResponseEntity<>("An error occurred during your request. Please try again!", HttpStatus.BAD_REQUEST);
    }

    private boolean userHasRole(User user, ERole role) {

        for(Role r: user.getRoles()) {
            if(r.getName().equals(role)) {
                return true;
            }
        }

        return false;
    }
}

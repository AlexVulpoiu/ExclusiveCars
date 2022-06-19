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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ServiceAppointmentService {

    private final ServiceAppointmentRepository serviceAppointmentRepository;

    private final AutoServiceRepository autoServiceRepository;

    private final UserRepository userRepository;

    private final JavaMailSender mailSender;

    @Autowired
    public ServiceAppointmentService(ServiceAppointmentRepository serviceAppointmentRepository, AutoServiceRepository autoServiceRepository, UserRepository userRepository, JavaMailSender mailSender) {
        this.serviceAppointmentRepository = serviceAppointmentRepository;
        this.autoServiceRepository = autoServiceRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    public ResponseEntity<?> getMyAppointments() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            List<ServiceAppointment> myAppointments = currentUser.getServices();

            if(myAppointments.isEmpty()) {
                return new ResponseEntity<>("Nu ai efectuat nicio programare momentan!", HttpStatus.OK);
            }

            List<ServiceAppointmentResponseDto> myAppointmentsDtoList = new ArrayList<>();
            for(ServiceAppointment serviceAppointment: myAppointments) {
                ServiceAppointmentResponseDto serviceAppointmentResponseDto = ServiceAppointmentResponseDto.builder()
                        .user(serviceAppointment.getUser().getFirstName() + " " + serviceAppointment.getUser().getLastName())
                        .userId(serviceAppointment.getUser().getId())
                        .phone(serviceAppointment.getUser().getPhone())
                        .autoServiceId(serviceAppointment.getAutoService().getId())
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

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> getAppointmentsForAutoService(Long autoServiceId) {

        Optional<AutoService> autoService = autoServiceRepository.findById(autoServiceId);
        if(autoService.isEmpty()) {
            return new ResponseEntity<>("Acest service auto nu există!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            List<ServiceAppointment> serviceAppointments = autoService.get().getUsers();
            if (serviceAppointments.isEmpty()) {
                return new ResponseEntity<>("Nu au fost făcute programări la acest service!", HttpStatus.OK);
            }

            List<ServiceAppointmentResponseDto> serviceAppointmentResponseDtos = new ArrayList<>();
            for(ServiceAppointment serviceAppointment: serviceAppointments) {
                ServiceAppointmentResponseDto serviceAppointmentResponseDto = ServiceAppointmentResponseDto.builder()
                        .user(serviceAppointment.getUser().getFirstName() + " " + serviceAppointment.getUser().getLastName())
                        .userId(serviceAppointment.getUser().getId())
                        .phone(serviceAppointment.getUser().getPhone())
                        .autoServiceId(serviceAppointment.getAutoService().getId())
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

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> makeAppointmentForAutoService(Long autoServiceId, ServiceAppointmentDto serviceAppointmentDto) throws MessagingException, UnsupportedEncodingException {

        Optional<AutoService> autoService = autoServiceRepository.findById(autoServiceId);
        if(autoService.isEmpty()) {
            return new ResponseEntity<>("Acest service auto nu există!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();

            if (userHasRole(currentUser, ERole.ROLE_ADMIN) || userHasRole(currentUser, ERole.ROLE_MODERATOR)
                || userHasRole(currentUser, ERole.ROLE_ORGANISATION)) {
                return new ResponseEntity<>("Nu ai permisiunea de a efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
            }

            List<ServiceAppointment> myAppointments = currentUser.getServices();
            for(ServiceAppointment appointment: myAppointments) {
                if(appointment.getId().getDate().equals(serviceAppointmentDto.getDate())) {
                    return new ResponseEntity<>("Ai efectuat deja o programare pentru ziua aceasta!", HttpStatus.METHOD_NOT_ALLOWED);
                }
            }

            ServiceAppointmentId serviceAppointmentId = ServiceAppointmentId.builder()
                    .userId(currentUser.getId())
                    .serviceId(autoServiceId)
                    .date(serviceAppointmentDto.getDate())
                    .build();

            AutoService currentAutoService = autoService.get();
            ServiceAppointment serviceAppointmentToAdd = ServiceAppointment.builder()
                    .id(serviceAppointmentId)
                    .problemDescription(serviceAppointmentDto.getProblemDescription())
                    .hour(serviceAppointmentDto.getHour())
                    .stationNumber(findStationNumber(currentAutoService, serviceAppointmentDto.getDate(), serviceAppointmentDto.getHour()))
                    .autoService(currentAutoService)
                    .user(currentUser)
                    .build();
            ServiceAppointment newServiceAppointment = serviceAppointmentRepository.save(serviceAppointmentToAdd);
            currentUser.addServiceAppointment(currentAutoService, serviceAppointmentToAdd);
            sendInformationEmail(currentUser, newServiceAppointment);

            return new ResponseEntity<>("Programarea a fost creată cu succes!", HttpStatus.OK);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
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
            return new ResponseEntity<>("Această programare nu există!", HttpStatus.NOT_FOUND);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            Optional<User> user = userRepository.findByUsername(username);

            if (user.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            User currentUser = user.get();
            ServiceAppointment serviceAppointment = appointment.get();
            Optional<AutoService> autoService = autoServiceRepository.findById(serviceId);

            if(autoService.isEmpty()) {
                return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
            }

            if(serviceAppointment.getUser() == currentUser) {

                currentUser.removeServiceAppointment(serviceAppointment);
                serviceAppointmentRepository.delete(serviceAppointment);
                return new ResponseEntity<>("Programarea a fost ștearsă cu succes!", HttpStatus.OK);
            }

            if(autoService.get().getOrganisation() == currentUser.getOrganisation()) {

                Optional<User> client = userRepository.findById(userId);
                if(client.isEmpty()) {
                    return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
                }
                User customer = client.get();
                customer.removeServiceAppointment(serviceAppointment);
                serviceAppointmentRepository.delete(serviceAppointment);
                return new ResponseEntity<>("Programarea a fost ștearsă cu succes!", HttpStatus.OK);
            }

            return new ResponseEntity<>("Nu ai permisiunea de a efectua această acțiune!", HttpStatus.METHOD_NOT_ALLOWED);
        }

        return new ResponseEntity<>("A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou!", HttpStatus.BAD_REQUEST);
    }

    private boolean userHasRole(User user, ERole role) {

        for(Role r: user.getRoles()) {
            if(r.getName().equals(role)) {
                return true;
            }
        }

        return false;
    }

    private void sendInformationEmail(User user, ServiceAppointment serviceAppointment)
            throws MessagingException, UnsupportedEncodingException {

        String toAddress = user.getEmail();
        String fromAddress = "exclusivecars22@outlook.com";
        String senderName = "ExclusiveCars";
        String subject = "Confirmare programare la service";
        String content = "Salut [[name]],<br><br>"
                + "Acesta este un mail de confirmare pentru programarea la service pe care tocmai ai efectuat-o.<br>"
                + "Aici sunt detaliile programării:"
                + "<ul>"
                + "<li>Nume client: [[clientName]]</li>"
                + "<li>Nume service: [[serviceName]]</li>"
                + "<li>Adresă service: [[serviceAddress]]</li>"
                + "<li>Data și ora: [[dateTime]]</li>"
                + "<li>Motivul vizitei: [[reason]]</li>"
                + "</ul>"
                + "<br>Te rugăm să te prezinți la stația [[stationNumber]].<br>"
                + "<br>Îți mulțumim,<br>"
                + "ExclusiveCars";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        content = content.replace("[[name]]", user.getFirstName() + " " + user.getLastName());
        content = content.replace("[[clientName]]", user.getFirstName() + " " + user.getLastName());
        content = content.replace("[[serviceName]]", serviceAppointment.getAutoService().getName());
        content = content.replace("[[serviceAddress]]", serviceAppointment.getAutoService().getCity()
                                                                + ", " + serviceAppointment.getAutoService().getAddress());
        content = content.replace("[[dateTime]]", serviceAppointment.getId().getDate().format(DateTimeFormatter.ofPattern("dd MMMM yy"))
                                                        + ", ora " + serviceAppointment.getHour().format(DateTimeFormatter.ofPattern("HH:mm")));
        content = content.replace("[[reason]]", serviceAppointment.getProblemDescription());
        content = content.replace("[[stationNumber]]", serviceAppointment.getStationNumber().toString());

        helper.setText(content, true);

        mailSender.send(message);
    }

    private int findStationNumber(AutoService autoService, LocalDate date, LocalTime time) {

        List<ServiceAppointment> serviceAppointments = autoService.getUsers();
        List<Integer> stations = new ArrayList<>();
        for(ServiceAppointment serviceAppointment: serviceAppointments) {
            if(serviceAppointment.getId().getDate().equals(date) && serviceAppointment.getHour().equals(time)) {
                stations.add(serviceAppointment.getStationNumber());
            }
        }

        Collections.sort(stations);

        for(int i = 0; i < stations.size(); i++) {
            if(stations.get(i) != i + 1) {
                return i + 1;
            }
        }

        return stations.size() + 1;
    }
}

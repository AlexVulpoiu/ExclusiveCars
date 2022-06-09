package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.ServiceAppointmentDto;
import com.fmi.exclusiveCars.services.ServiceAppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.validation.Valid;
import java.io.UnsupportedEncodingException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/serviceAppointments")
public class ServiceAppointmentController {

    private final ServiceAppointmentService serviceAppointmentService;

    @Autowired
    public ServiceAppointmentController(ServiceAppointmentService serviceAppointmentService) {
        this.serviceAppointmentService = serviceAppointmentService;
    }

    @GetMapping("")
    public ResponseEntity<?> getMyAppointments() {
        return serviceAppointmentService.getMyAppointments();
    }

    @GetMapping("/{autoServiceId}")
    public ResponseEntity<?> getAppointmentsForAutoService(@PathVariable Long autoServiceId) {
        return serviceAppointmentService.getAppointmentsForAutoService(autoServiceId);
    }

    @PostMapping("/makeAppointment/{autoServiceId}")
    public ResponseEntity<?> makeAppointmentForAutoService(@PathVariable Long autoServiceId, @Valid @RequestBody ServiceAppointmentDto serviceAppointmentDto) throws MessagingException, UnsupportedEncodingException {
        return serviceAppointmentService.makeAppointmentForAutoService(autoServiceId, serviceAppointmentDto);
    }

    @DeleteMapping("/deleteAppointment/{serviceAppointmentId}")
    public ResponseEntity<?> deleteAppointment(@PathVariable String serviceAppointmentId) {
        return serviceAppointmentService.deleteAppointment(serviceAppointmentId);
    }
}

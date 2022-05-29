package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.dto.ServiceAppointmentDto;
import com.fmi.exclusiveCars.services.ServiceAppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

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
    @PreAuthorize("hasRole('ORGANISATION') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getAppointmentsForAutoService(@PathVariable Long autoServiceId) {
        return serviceAppointmentService.getAppointmentsForAutoService(autoServiceId);
    }

    @PostMapping("/makeAppointment/{autoServiceId}")
    public ResponseEntity<?> makeAppointmentForAutoService(@PathVariable Long autoServiceId, @Valid @RequestBody ServiceAppointmentDto serviceAppointmentDto) {
        return serviceAppointmentService.makeAppointmentForAutoService(autoServiceId, serviceAppointmentDto);
    }

    @DeleteMapping("/deleteAppointment/{serviceAppointmentId}")
    public ResponseEntity<?> deleteAppointment(@PathVariable String serviceAppointmentId) {
        return serviceAppointmentService.deleteAppointment(serviceAppointmentId);
    }
}

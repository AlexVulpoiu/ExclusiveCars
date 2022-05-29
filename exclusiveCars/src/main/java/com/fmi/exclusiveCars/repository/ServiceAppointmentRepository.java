package com.fmi.exclusiveCars.repository;

import com.fmi.exclusiveCars.model.ServiceAppointment;
import com.fmi.exclusiveCars.model.ServiceAppointmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceAppointmentRepository extends JpaRepository<ServiceAppointment, Long> {

    @Query("SELECT s FROM ServiceAppointment s WHERE s.id = ?1")
    Optional<ServiceAppointment> findById(ServiceAppointmentId id);
}

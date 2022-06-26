package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganisationStatsDto {

    private String organisationName;

    private Long totalServiceAppointments;

    private Long lastMonthServiceAppointments;

    private String mostVisitedAutoService;

    private Long mostVisitedAutoServiceId;

    private Long mostVisitedAutoServiceTotalAppointments;

    private Long mostVisitedAutoServiceLastMonthAppointments;

    private HashMap<String, Long> autoServicesByCity;

    private Long totalCarRentals;

    private Long lastMonthCarRentals;

    private String mostProfitableCar;

    private Long mostProfitableCarAnnouncementId;

    private Long mostProfitableCarProfit;

    private String mostRentedCar;

    private Long mostRentedCarAnnouncementId;

    private Long mostRentedCarTotalRentals;

    private Long mostRentedCarLastMonthRentals;

    private Long mostRentedCarProfit;

    private HashMap<String, Long> carRentalsByBrand;

    private HashMap<String, Long> rentalCentersByCity;
}

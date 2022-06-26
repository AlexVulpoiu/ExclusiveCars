package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEditDto {

    @Pattern(regexp = "^[A-Z][a-zA-Z\\s]{2,29}$", message = "Prenumele trebuie să înceapă cu literă mare și să conțină între 3 și 30 de caractere (litere și spații)!")
    private String firstName;

    @Pattern(regexp = "^[A-Z][a-zA-Z\\s]{2,29}$", message = "Numele de familie trebuie să înceapă cu literă mare și să conțină între 3 și 30 de caractere (litere și spații)!")
    private String lastName;

    @Pattern(regexp = "^07[0-9]{8}$", message = "Numărul de telefon trebuie să aibă 10 cifre și să înceapă cu '07'!")
    private String phone;

    private String newPassword;
}

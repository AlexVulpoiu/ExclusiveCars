package com.fmi.exclusiveCars.controllers;

import com.fmi.exclusiveCars.model.ERole;
import com.fmi.exclusiveCars.model.Role;
import com.fmi.exclusiveCars.model.User;
import com.fmi.exclusiveCars.payload.request.LoginRequest;
import com.fmi.exclusiveCars.payload.request.SignupRequest;
import com.fmi.exclusiveCars.payload.response.JwtResponse;
import com.fmi.exclusiveCars.payload.response.MessageResponse;
import com.fmi.exclusiveCars.repository.RoleRepository;
import com.fmi.exclusiveCars.repository.UserRepository;
import com.fmi.exclusiveCars.security.jwt.JwtUtils;
import com.fmi.exclusiveCars.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String SITE_URL = "http://localhost:8090";

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());
        if(user.isEmpty()) {
            return new ResponseEntity<>("A intervenit o eroare in timpul autentificarii. Te rugam sa incerci din nou!", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.get().getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        if(!userDetails.isEnabled()) {
            return new ResponseEntity<>("Trebuie sa iti validezi contul inainte de logare!", HttpStatus.BAD_REQUEST);
        }
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) throws MessagingException, UnsupportedEncodingException, NoSuchAlgorithmException {
        if(userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Eroare: acest username exista deja!"));
        }

        if(userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Eroare: acest email este deja in uz!"));
        }

        if(userRepository.existsByPhone(signUpRequest.getPhone())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Eroare: acest numar de telefon este deja in uz!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getPhone());

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Eroare: rolul nu a fost gasit!"));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Eroare: rolul nu a fost gasit!"));
                        roles.add(adminRole);

                        break;
                    case "organisation":
                        Role organisationRole = roleRepository.findByName(ERole.ROLE_ORGANISATION)
                                .orElseThrow(() -> new RuntimeException("Eroare: rolul nu a fost gasit!"));
                        roles.add(organisationRole);

                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Eroare: rolul nu a fost gasit!"));
                        roles.add(modRole);

                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Eroare: rolul nu a fost gasit!"));
                        roles.add(userRole);
                }
            });
        }

        String characters = "0123456789abcdefghijklmnopqrstuvwxyz-_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        SecureRandom secureRandom = SecureRandom.getInstanceStrong();
        String randomCode = secureRandom.ints(64, 0, characters.length()).mapToObj(characters::charAt)
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append).toString();

        user.setVerificationCode(randomCode);
        user.setEnabled(false);

        user.setRoles(roles);
        userRepository.save(user);

        sendVerificationEmail(user);

        return ResponseEntity.ok(new MessageResponse("Felicitari, te-ai inregistrat cu succes! Verifica email-ul pentru a activa contul!"));
    }

    @PostMapping("/processRegister")
    public ResponseEntity<?> processRegister(SignupRequest signupRequest, HttpServletRequest request)
            throws MessagingException, UnsupportedEncodingException, NoSuchAlgorithmException {
        registerUser(signupRequest);
        return new ResponseEntity<>("Felicitari, te-ai inregistrat cu succes! Verifica email-ul pentru a activa contul!", HttpStatus.OK);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(@Param("code") String code) {
        if(verify(code)) {
            return new ResponseEntity<>("Contul a fost validat cu succes! Acum poti folosi aplicatia!", HttpStatus.OK);
        }
        return new ResponseEntity<>("Verificarea contului a esuat! :(", HttpStatus.BAD_REQUEST);
    }

    private String getSiteURL(HttpServletRequest request) {
        String siteURL = request.getRequestURL().toString();
        return siteURL.replace(request.getServletPath(), "");
    }

    private void sendVerificationEmail(User user)
            throws MessagingException, UnsupportedEncodingException {

        String toAddress = user.getEmail();
        String fromAddress = "exclusivecars22@outlook.com";
        String senderName = "ExclusiveCars";
        String subject = "Verificare înregistrare";
        String content = "Salut [[name]],<br>"
                + "Te rugăm să accesezi link-ul de mai jos pentru a confirma crearea contului pe platforma ExclusiveCars:<br>"
                + "<h3><a href=\"[[URL]]\" target=\"_self\">CONFIRMĂ</a></h3>"
                + "Mulțumim,<br>"
                + "ExclusiveCars";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        content = content.replace("[[name]]", user.getFirstName() + " " + user.getLastName());
        String verifyURL = SITE_URL + "/api/auth/verify?code=" + user.getVerificationCode();

        content = content.replace("[[URL]]", verifyURL);

        helper.setText(content, true);

        mailSender.send(message);
    }

    public boolean verify(String verificationCode) {
        User user = userRepository.findByVerificationCode(verificationCode);

        if (user == null || user.getEnabled()) {
            return false;
        } else {
            user.setVerificationCode(null);
            user.setEnabled(true);
            userRepository.save(user);

            return true;
        }

    }
}

package com.fmi.exclusiveCars.security;

import com.fmi.exclusiveCars.security.jwt.AuthEntryPointJwt;
import com.fmi.exclusiveCars.security.jwt.AuthTokenFilter;
import com.fmi.exclusiveCars.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.security.SecureRandom;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Override
    public void configure(AuthenticationManagerBuilder authenticationManagerBuilder) throws Exception {
        authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10, new SecureRandom());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeRequests().antMatchers("/api/auth/**").permitAll()
                .antMatchers("/api/news", "/api/news/**").permitAll()
                .antMatchers("/api/users", "/api/users/**").authenticated()
                .antMatchers("/api/rentalCenters", "/api/rentalCenters/**").authenticated()
                .antMatchers("/api/autoServices", "/api/autoServices/**").authenticated()
                .antMatchers("/api/organisations").hasAnyRole("MODERATOR", "ADMIN")
                .antMatchers("/api/organisations/**").authenticated()
                .antMatchers("/api/serviceAppointments", "/api/serviceAppointments/**").authenticated()
                .antMatchers("/api/carModels/add").authenticated()
                .antMatchers("/api/cars/**").authenticated()
                .antMatchers("/api/rentalAnnouncements/**").authenticated()
                .antMatchers("/api/sellingAnnouncements", "/api/sellingAnnouncements/**").authenticated()
                .antMatchers("/api/images/**").authenticated()
                .antMatchers("/api/favoriteSellingAnnouncements", "/api/favoriteSellingAnnouncements/**").authenticated()
                .antMatchers("/api/rentCars/**").authenticated()
                .anyRequest().authenticated();

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
    }
}

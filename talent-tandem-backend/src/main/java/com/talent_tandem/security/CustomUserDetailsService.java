package com.talent_tandem.security;
import com.talent_tandem.model.User;
import com.talent_tandem.repository.IUserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final IUserRepo userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String role = user.getRole() != null ? "ROLE_" + user.getRole().name() : "ROLE_LEARNER";
        boolean isEmailVerified = Boolean.TRUE.equals(user.getIsEmailVerified());
        boolean isSuspended = Boolean.TRUE.equals(user.getIsSuspended());
        boolean isDisabled = !isEmailVerified || isSuspended;
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(role)
                .accountExpired(false)
                .accountLocked(Boolean.TRUE.equals(user.getIsSuspended()))
                .credentialsExpired(false)
                .disabled(isDisabled)
                .build();
    }
}
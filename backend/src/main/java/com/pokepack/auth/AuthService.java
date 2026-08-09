package com.pokepack.auth;

import com.pokepack.auth.dto.AuthResponse;
import com.pokepack.auth.exception.EmailAlreadyInUseException;
import com.pokepack.auth.exception.InvalidCredentialsException;
import com.pokepack.user.User;
import com.pokepack.user.UserRepository;
import com.pokepack.user.UserStats;
import com.pokepack.user.UserStatsRepository;
import com.pokepack.user.dto.UserDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long startingCoins;

    public AuthService(
            UserRepository userRepository,
            UserStatsRepository userStatsRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${pokepack.starting-coins:500}") long startingCoins
    ) {
        this.userRepository = userRepository;
        this.userStatsRepository = userStatsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.startingCoins = startingCoins;
    }

    @Transactional
    public AuthResponse register(String name, String email, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new EmailAlreadyInUseException(normalizedEmail);
        }

        User user = new User(name.trim(), normalizedEmail);
        user.setCoins(startingCoins);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setLastLoginAt(Instant.now());
        user = userRepository.save(user);
        userStatsRepository.save(new UserStats(user));

        return new AuthResponse(jwtService.generateToken(user.getId()), UserDto.from(user));
    }

    @Transactional
    public AuthResponse login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(InvalidCredentialsException::new);

        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        user.setLastLoginAt(Instant.now());
        return new AuthResponse(jwtService.generateToken(user.getId()), UserDto.from(user));
    }
}

package com.pokepack.auth;

import com.pokepack.auth.dto.AuthResponse;
import com.pokepack.auth.exception.EmailAlreadyInUseException;
import com.pokepack.auth.exception.InvalidCredentialsException;
import com.pokepack.user.UserRepository;
import com.pokepack.user.UserStatsRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@DirtiesContext
class AuthServiceIntegrationTest {

    @Autowired
    private AuthService authService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserStatsRepository userStatsRepository;

    @Test
    void registeringCreatesAUserWithStartingCoinsAndAStatsRow() {
        AuthResponse response = authService.register("Nieuwe Speler", "nieuw@example.com", "hunter22");

        assertThat(response.token()).isNotBlank();
        assertThat(jwtService.extractUserId(response.token())).isEqualTo(response.user().id());
        assertThat(response.user().coins()).isEqualTo(500);
        assertThat(response.user().email()).isEqualTo("nieuw@example.com");

        assertThat(userStatsRepository.findById(response.user().id())).isPresent();
    }

    @Test
    void emailIsNormalizedToLowercaseAndTrimmed() {
        AuthResponse response = authService.register("Casing Test", "  Mixed.Case@Example.com  ", "hunter22");

        assertThat(response.user().email()).isEqualTo("mixed.case@example.com");
    }

    @Test
    void registeringWithAnEmailAlreadyInUseIsRejected() {
        authService.register("First", "duplicate@example.com", "hunter22");

        assertThatThrownBy(() -> authService.register("Second", "duplicate@example.com", "otherpass"))
                .isInstanceOf(EmailAlreadyInUseException.class);
    }

    @Test
    void loggingInWithTheRightPasswordSucceeds() {
        authService.register("Login Test", "login@example.com", "correct-password");

        AuthResponse response = authService.login("login@example.com", "correct-password");

        assertThat(response.token()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("login@example.com");
    }

    @Test
    void loggingInWithTheWrongPasswordIsRejected() {
        authService.register("Login Test 2", "login2@example.com", "correct-password");

        assertThatThrownBy(() -> authService.login("login2@example.com", "wrong-password"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void loggingInWithAnUnknownEmailIsRejected() {
        assertThatThrownBy(() -> authService.login("does-not-exist@example.com", "whatever"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void passwordsAreHashedNotStoredInPlainText() {
        AuthResponse response = authService.register("Hash Test", "hash@example.com", "plaintext-password");

        var stored = userRepository.findById(response.user().id()).orElseThrow();
        assertThat(stored.getPasswordHash()).isNotEqualTo("plaintext-password");
        assertThat(stored.getPasswordHash()).startsWith("$2"); // BCrypt-prefix
    }
}

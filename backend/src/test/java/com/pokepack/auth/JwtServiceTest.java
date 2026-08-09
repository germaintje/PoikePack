package com.pokepack.auth;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = "test-secret-that-is-at-least-32-bytes-long-for-hs256!!";

    @Test
    void tokenRoundTripsToTheSameUserId() {
        JwtService jwtService = new JwtService(SECRET, 60);

        String token = jwtService.generateToken(42L);

        assertThat(jwtService.extractUserId(token)).isEqualTo(42L);
    }

    @Test
    void garbageTokenReturnsNullInsteadOfThrowing() {
        JwtService jwtService = new JwtService(SECRET, 60);

        assertThat(jwtService.extractUserId("not-a-real-token")).isNull();
    }

    @Test
    void tokenSignedWithADifferentSecretIsRejected() {
        JwtService issuer = new JwtService(SECRET, 60);
        JwtService verifier = new JwtService("a-completely-different-secret-that-is-also-32-bytes!!", 60);

        String token = issuer.generateToken(7L);

        assertThat(verifier.extractUserId(token)).isNull();
    }

    @Test
    void expiredTokenIsRejected() throws InterruptedException {
        // 0 minuten + wachten tot na het uitgiftemoment forceert een verlopen token zonder
        // kunstmatig de klok te hoeven manipuleren.
        JwtService jwtService = new JwtService(SECRET, 0);
        String token = jwtService.generateToken(1L);

        Thread.sleep(50);

        assertThat(jwtService.extractUserId(token)).isNull();
    }
}

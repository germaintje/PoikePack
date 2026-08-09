package com.pokepack.common;

import org.springframework.security.core.Authentication;

/** JwtAuthenticationFilter zet de user-id (als string) als authentication-naam — dit haalt 'm
 * er weer als Long uit, zodat controllers niet zelf met de rauwe Authentication hoeven te klooien. */
public final class AuthUtil {

    private AuthUtil() {
    }

    public static Long userId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }
}

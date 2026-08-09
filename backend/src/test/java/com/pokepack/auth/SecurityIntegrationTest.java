package com.pokepack.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DirtiesContext
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private AuthService authService;

    @Test
    void protectedEndpointWithoutTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithGarbageTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithAValidTokenSucceeds() throws Exception {
        var response = authService.register("Security Test", "security@example.com", "hunter22");

        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + response.token()))
                .andExpect(status().isOk());
    }

    @Test
    void publicPackListingEndpointWorksWithoutAToken() throws Exception {
        mockMvc.perform(get("/api/packs"))
                .andExpect(status().isOk());
    }

    @Test
    void registerAndLoginEndpointsArePublic() throws Exception {
        String body = """
                {"name":"Public Endpoint Test","email":"public@example.com","password":"hunter22"}
                """;

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());
    }

    @Test
    void openingAPackWithoutATokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/packs/1/open"))
                .andExpect(status().isUnauthorized());
    }
}

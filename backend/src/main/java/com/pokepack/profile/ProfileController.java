package com.pokepack.profile;

import com.pokepack.common.AuthUtil;
import com.pokepack.common.UserNotFoundException;
import com.pokepack.profile.dto.ProfileDto;
import com.pokepack.profile.dto.UpdateProfileRequest;
import com.pokepack.user.User;
import com.pokepack.user.UserRepository;
import com.pokepack.user.UserStatsService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final UserStatsService userStatsService;

    public ProfileController(UserRepository userRepository, UserStatsService userStatsService) {
        this.userRepository = userRepository;
        this.userStatsService = userStatsService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ProfileDto get(Authentication authentication) {
        User user = findUser(authentication);
        return ProfileDto.from(user, userStatsService.getOrCreateStats(user.getId()));
    }

    @PatchMapping
    @Transactional
    public ProfileDto update(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        User user = findUser(authentication);

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if (request.avatarEmoji() != null && !request.avatarEmoji().isBlank()) {
            user.setAvatarEmoji(request.avatarEmoji());
        }
        if (request.bio() != null) {
            user.setBio(request.bio().isBlank() ? null : request.bio());
        }

        return ProfileDto.from(user, userStatsService.getOrCreateStats(user.getId()));
    }

    private User findUser(Authentication authentication) {
        Long userId = AuthUtil.userId(authentication);
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    }
}

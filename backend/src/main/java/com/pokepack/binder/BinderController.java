package com.pokepack.binder;

import com.pokepack.binder.dto.BinderEntryDto;
import com.pokepack.common.AuthUtil;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/binder")
public class BinderController {

    private final UserCardRepository userCardRepository;

    public BinderController(UserCardRepository userCardRepository) {
        this.userCardRepository = userCardRepository;
    }

    @GetMapping
    public List<BinderEntryDto> getBinder(Authentication authentication) {
        Long userId = AuthUtil.userId(authentication);
        return userCardRepository.findAllByUserIdWithCardAndSet(userId).stream()
                .map(uc -> new BinderEntryDto(
                        uc.getCard().getId(),
                        uc.getCard().getName(),
                        uc.getCard().getSet().getId(),
                        uc.getCard().getSet().getName(),
                        uc.getCard().getNumber(),
                        uc.getCard().getRarity(),
                        uc.getCard().getImageLargeUrl(),
                        uc.getQuantity()
                ))
                .toList();
    }
}

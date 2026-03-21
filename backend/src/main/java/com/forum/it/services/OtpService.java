package com.forum.it.services;

import java.security.SecureRandom;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpService {

    RedisService redisService;
    static int OTP_LENGTH = 6;
    static long OTP_EXPIRY_MINUTES = 1; // Thoi gian het han OTP (2 phut)

    public String generateOtp(String email) {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return redisService.saveOtp(email, otp.toString());
    }

    public boolean verifyOtp(String email, String otp) {
        String savedOtp = redisService.getOtp(email);
        if (savedOtp != null && savedOtp.equals(otp)) {
            redisService.deleteOtp(email);
            return true;
        }
        return false;
    }
}

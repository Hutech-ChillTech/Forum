package com.forum.it.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class EmailService {

    final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    String fromEmail;

    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Mã OTP Đăng nhập - Forum IT");

            String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>"
                            +
                            "    <h2 style='color: #007bff; text-align: center;'>Chào mừng bạn đến với Forum IT</h2>" +
                            "    <p style='font-size: 16px; color: #333;'>Bạn đang thực hiện đăng nhập vào hệ thống. Vui lòng sử dụng mã OTP dưới đây để hoàn tất:</p>"
                            +
                            "    <div style='background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;'>"
                            +
                            "        <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #28a745;'>%s</span>"
                            +
                            "    </div>" +
                            "    <p style='font-size: 14px; color: #666;'>Mã này sẽ hết hạn sau 2 phút. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>"
                            +
                            "    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>" +
                            "    <p style='font-size: 12px; color: #999; text-align: center;'>&copy; 2024 Forum IT. All rights reserved.</p>"
                            +
                            "</div>",
                    otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP email sent successfully to {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }
}

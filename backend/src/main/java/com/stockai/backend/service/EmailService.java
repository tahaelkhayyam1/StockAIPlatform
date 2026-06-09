package com.stockai.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("StockAI - Password Reset");
        message.setText("Your password has been reset by the Super Admin.\n\n" +
                "Your new temporary password is: " + newPassword + "\n\n" +
                "Please log in and change it as soon as possible.");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // For development without real SMTP credentials, we will just log it
            System.err.println("Failed to send email to " + to + ". Make sure SMTP is configured.");
            System.err.println("New password generated: " + newPassword);
        }
    }

    public void send2FACode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("DXC Technology - Code de Vérification (2FA)");
        message.setText("Bonjour,\n\n" +
                "Votre code de vérification à 6 chiffres est : " + code + "\n\n" +
                "Ce code expirera dans 5 minutes.\n" +
                "Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.");

        try {
            mailSender.send(message);
            System.out.println("2FA Email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send 2FA email to " + to + ". " + e.getMessage());
            System.err.println("2FA Code generated: " + code);
        }
    }
}

<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/phpmailer/phpmailer/src/Exception.php';
require 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require 'vendor/phpmailer/phpmailer/src/SMTP.php';

class MailModel extends DB
{
    protected $mail;

    public function __construct()
    {
        parent::__construct();
        $this->mail = new PHPMailer(true);

        $this->mail->CharSet = 'UTF-8';
        $this->mail->isSMTP();
        $this->mail->Host = 'smtp.gmail.com';
        $this->mail->SMTPAuth = true;
        $this->mail->Username = 'ontestdht@gmail.com';
        $this->mail->Password = str_replace(' ', '', 'peuhdht ehtcoodlp'); // App Password Gmail
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port = 587;
        $this->mail->setFrom('ontestdht@gmail.com', 'DHT OnTest');
        $this->mail->SMTPDebug = SMTP::DEBUG_OFF;
    }

    // Gửi email thông báo đề thi
    public function sendExamNotify($email, $studentName, $examName, $subjectName, $link)
    {
        try {
            $this->mail->clearAllRecipients();
            $this->mail->addAddress($email);
            $this->mail->isHTML(true);

            $this->mail->Subject = mb_encode_mimeheader("Thông báo bài thi mới: $examName", "UTF-8");

            $this->mail->Body = '
                <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
                    <h2 style="color: #115e59;">Thông báo bài thi mới</h2>

                    <p>Chào <strong>' . htmlspecialchars($studentName) . '</strong>,</p>

                    <p>Bạn vừa được giao một bài thi mới:</p>

                    <ul>
                        <li><strong>Bài thi:</strong> ' . htmlspecialchars($examName) . '</li>
                        <li><strong>Môn học:</strong> ' . htmlspecialchars($subjectName) . '</li>
                    </ul>

                    <p>Nhấn vào link dưới đây để xem chi tiết và bắt đầu làm bài:</p>

                    <p><a href="' . $link . '" target="_blank" 
                        style="color: #2563eb; text-decoration: underline; font-size: 16px;">
                        Mở bài thi
                    </a></p>

                    <hr>
                    <p style="font-size: 12px; color: #666;">Email tự động từ hệ thống OnTest DHT.</p>
                </div>
            ';

            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Mail error: " . $this->mail->ErrorInfo);
            return false;
        }
    }
}

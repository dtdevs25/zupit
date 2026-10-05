import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.ehspro.com.br',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'zupit@ehspro.com.br',
    pass: process.env.SMTP_PASS || 'nova@2026',
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendWelcomeEmail = async (email: string, name: string, tempPassword?: string) => {
  try {
    let text = `Olá ${name},\n\nBem-vindo ao ZUPiT!\n`;
    let html = `<h2>Olá ${name},</h2><p>Bem-vindo ao ZUPiT!</p>`;
    
    if (tempPassword) {
      text += `Sua conta foi criada por um administrador.\nSua senha de acesso é: ${tempPassword}\n\nRecomendamos que você altere sua senha após o primeiro acesso.\n`;
      html += `<p>Sua conta foi criada por um administrador.</p><p>Sua senha de acesso é: <strong>${tempPassword}</strong></p><p>Recomendamos que você altere sua senha após o primeiro acesso.</p>`;
    }
    
    text += `\nAcesse agora: https://zupit.com.br\n\nAbraços,\nEquipe ZUPiT!`;
    html += `<br><p>Acesse agora: <a href="https://zupit.com.br">zupit.com.br</a></p><br><p>Abraços,<br>Equipe ZUPiT!</p>`;

    const info = await transporter.sendMail({
      from: '"ZUPiT!" <zupit@ehspro.com.br>',
      to: email,
      subject: 'Bem-vindo ao ZUPiT!',
      text,
      html,
    });
    console.log('Welcome email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string) => {
  try {
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`; // Adjust URL as needed
    
    const text = `Olá ${name},\n\nVocê solicitou a redefinição de sua senha.\nClique no link abaixo para criar uma nova senha:\n${resetUrl}\n\nSe você não solicitou isso, ignore este e-mail.\n\nAbraços,\nEquipe ZUPiT!`;
    const html = `<h2>Olá ${name},</h2><p>Você solicitou a redefinição de sua senha.</p><p>Clique no link abaixo para criar uma nova senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><br><p>Se você não solicitou isso, ignore este e-mail.</p><br><p>Abraços,<br>Equipe ZUPiT!</p>`;

    const info = await transporter.sendMail({
      from: '"ZUPiT! Segurança" <zupit@ehspro.com.br>',
      to: email,
      subject: 'ZUPiT! - Redefinição de Senha',
      text,
      html,
    });
    console.log('Password reset email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

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

const BASE_URL = process.env.PUBLIC_URL || 'https://zupit.ehspro.com.br';

const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 20px; }
    .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; }
    .logo { height: 60px; margin-bottom: 20px; }
    .divider { height: 2px; background-color: #22c55e; width: 90%; margin: 0 auto 30px auto; border-radius: 2px; }
    .content { color: #374151; font-size: 16px; line-height: 1.6; text-align: left; }
    .btn { display: inline-block; background-color: #9333ea; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 16px; margin-top: 20px; }
    .footer { margin-top: 40px; font-size: 13px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <img src="${BASE_URL}/esquerdatrofeu.png" alt="ZUPiT!" class="logo" />
    <div class="divider"></div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      Feito com ❤️ pela equipe ZUPiT!
    </div>
  </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (email: string, name: string, tempPassword?: string) => {
  try {
    const firstName = name.split(' ')[0] || 'Aventureiro';
    let content = `
      <h2 style="color: #4c1d95; margin-bottom: 15px;">E aí, ${firstName}! 🎉</h2>
      <p>A emoção está só começando. Prepare-se para criar e jogar os quizzes mais irados do universo!</p>
    `;
    
    if (tempPassword) {
      content += `
        <div style="background-color: #fdf4ff; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px dashed #d8b4fe; text-align: center;">
          <p style="margin: 0; color: #7e22ce; font-size: 14px; font-weight: bold;">Seu acesso secreto foi gerado:</p>
          <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #4c1d95;">${tempPassword}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Dica de mestre: troque essa senha assim que entrar, beleza?</p>
      `;
    }
    
    content += `<div style="text-align: center;"><a href="${BASE_URL}" class="btn">Entrar no Jogo 🚀</a></div>`;

    const html = getEmailTemplate(content);

    const info = await transporter.sendMail({
      from: '"ZUPiT! Jogos" <zupit@ehspro.com.br>',
      to: email,
      subject: 'Bem-vindo ao ZUPiT! A diversão começou! 🎮',
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
    const firstName = name.split(' ')[0] || 'Aventureiro';
    const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;
    
    const content = `
      <h2 style="color: #4c1d95; margin-bottom: 15px;">Ops, esqueceu a senha, ${firstName}? 😅</h2>
      <p>Fica tranquilo! Acontece até com os melhores jogadores. Já preparamos tudo para você voltar pra partida.</p>
      <p>Clique no botão abaixo para criar uma senha nova, fresquinha e super secreta:</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${resetUrl}" class="btn">🔑 Criar Nova Senha</a>
      </div>
      <p style="margin-top: 30px; font-size: 13px; color: #9ca3af; text-align: center;">
        Se não foi você que pediu isso, é só ignorar essa mensagem. O seu jogo continua salvo!
      </p>
    `;

    const html = getEmailTemplate(content);

    const info = await transporter.sendMail({
      from: '"Segurança ZUPiT!" <zupit@ehspro.com.br>',
      to: email,
      subject: 'Opa! Vamos redefinir sua senha do ZUPiT! 🔐',
      html,
    });
    console.log('Password reset email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

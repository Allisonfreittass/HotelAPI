const nodemailer = require('nodemailer');

// Configurar o transporter do nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Função para enviar email de notificação de login
const sendLoginNotification = async (userEmail, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Notificação de Login - Hotel Vitória',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #2c3e50; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Hotel Vitória</h1>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; margin-top: 0;">Olá ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Detectamos um novo acesso à sua conta no Hotel Vitória. Para sua segurança, estamos enviando esta notificação.
            </p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2c3e50;">
              <h3 style="color: #2c3e50; margin-top: 0;">Detalhes do Acesso:</h3>
              <p style="margin: 10px 0;"><strong>Data e Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p style="margin: 10px 0;"><strong>Usuário:</strong> ${username}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${userEmail}</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Importante</h4>
              <p style="color: #666; margin: 0;">
                Se você não realizou este acesso, por favor:
              </p>
              <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
                <li>Altere sua senha imediatamente</li>
                <li>Entre em contato com nossa equipe de suporte</li>
                <li>Verifique se seu email está seguro</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/alterar-senha" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Alterar Senha
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Esta é uma mensagem automática, por favor não responda a este email.</p>
            <p>© ${new Date().getFullYear()} Hotel Vitória. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email de notificação enviado com sucesso para:', userEmail);
  } catch (error) {
    console.error('Erro ao enviar email de notificação:', error);
    throw error;
  }
};

module.exports = {
  sendLoginNotification
}; 
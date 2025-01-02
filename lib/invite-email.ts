export const createInviteEmailHtml = (role: string, inviteLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Convite para Equipe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Você foi convidado!</h2>
    <p>Você foi convidado para ingressar na equipe como <strong>${role}</strong>.</p>
    <p>Para aceitar o convite, clique no botão abaixo:</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
           Aceitar Convite
        </a>
    </div>
    <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
    <p>${inviteLink}</p>
</body>
</html>
`;
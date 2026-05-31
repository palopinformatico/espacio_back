import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private isConfigured: boolean;

  constructor() {
    console.log('🔍 MAIL SERVICE: Inicializando servicio de email...');
    
    // Verificar si las credenciales están configuradas
    console.log('🔍 MAIL SERVICE: Verificando variables de entorno...');
    console.log('🔍 MAIL SERVICE: MAIL_USER:', process.env.MAIL_USER ? '✅ EXISTE' : '❌ NO EXISTE');
    console.log('🔍 MAIL SERVICE: MAIL_PASSWORD:', process.env.MAIL_PASSWORD ? '✅ EXISTE (longitud: ' + process.env.MAIL_PASSWORD.length + ')' : '❌ NO EXISTE');
    console.log('🔍 MAIL SERVICE: MAIL_HOST:', process.env.MAIL_HOST || '❌ NO EXISTE');
    console.log('🔍 MAIL SERVICE: MAIL_PORT:', process.env.MAIL_PORT || '❌ NO EXISTE');
    console.log('🔍 MAIL SERVICE: MAIL_IS_SECURE:', process.env.MAIL_IS_SECURE || '❌ NO EXISTE');
    console.log('🔍 MAIL SERVICE: MAIL_FROM:', process.env.MAIL_FROM || '❌ NO EXISTE');

    const hasCredentials = process.env.MAIL_USER && process.env.MAIL_PASSWORD;

    if (hasCredentials) {
      const port = parseInt(process.env.MAIL_PORT) || 587;
      const isSecure = process.env.MAIL_IS_SECURE === 'true' || port === 465;
      const host = process.env.MAIL_HOST || 'smtp.gmail.com';

      console.log('🔍 MAIL SERVICE: Creando transporter con nodemailer...');
      console.log(`🔍 MAIL SERVICE: Configuración -> Host: ${host}, Puerto: ${port}, Secure: ${isSecure}`);

      this.transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: isSecure, // true para 465 (SSL/TLS)
        requireTLS: isSecure, // Fuerza TLS
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false, // Acepta certificados autofirmados
          minVersion: 'TLSv1.2', // Versión mínima de TLS
          servername: host, // SNI
        },
        connectionTimeout: 30000, // 30 segundos
        greetingTimeout: 30000,
        socketTimeout: 30000,
        debug: true, // Activar debug para ver trazas detalladas
        logger: true, // Activar logger
      });
      
      this.isConfigured = true;
      console.log('✅ MAIL SERVICE: Servicio de email configurado correctamente');
      console.log(`📧 MAIL SERVICE: Host: ${host}, Puerto: ${port}, Secure: ${isSecure}`);
      console.log(`🔐 MAIL SERVICE: Usuario: ${process.env.MAIL_USER}`);
      
      // Verificar la conexión
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ MAIL SERVICE: Error al verificar conexión SMTP:', error);
        } else {
          console.log('✅ MAIL SERVICE: Conexión SMTP verificada exitosamente');
        }
      });
    } else {
      this.isConfigured = false;
      console.warn('⚠️ MAIL SERVICE: Servicio de email NO configurado - Agrega MAIL_USER y MAIL_PASSWORD en tu archivo .env');
    }
  }

  async sendOrderConfirmation(orderData: {
    customerEmail: string;
    customerName: string;
    numeroVenta: number;
    fecha: string;
    orderType: string;
    customerAddress?: string;
    tiempoEstimado?: string;
    products: Array<{ name: string; cantidad: number; price: number }>;
    subtotal: number;
    costoEnvio: number;
    total: number;
  }) {
    console.log('📧 MAIL SERVICE: Iniciando sendOrderConfirmation...');
    console.log('📧 MAIL SERVICE: isConfigured:', this.isConfigured);
    
    const {
      customerEmail,
      customerName,
      numeroVenta,
      fecha,
      orderType,
      customerAddress,
      tiempoEstimado,
      products,
      subtotal,
      costoEnvio,
      total,
    } = orderData;

    console.log('📧 MAIL SERVICE: Datos recibidos:', {
      customerEmail,
      customerName,
      numeroVenta,
      fecha,
      orderType,
      productsCount: products?.length || 0,
    });
    
    // Si no está configurado, salir sin error
    if (!this.isConfigured) {
      console.log('⚠️ MAIL SERVICE: Email no enviado - servicio no configurado');
      console.log('📧 MAIL SERVICE: MAIL_USER existe:', !!process.env.MAIL_USER);
      console.log('📧 MAIL SERVICE: MAIL_PASSWORD existe:', !!process.env.MAIL_PASSWORD);
      console.log('📧 MAIL SERVICE: MAIL_HOST existe:', !!process.env.MAIL_HOST);
      console.log('📧 MAIL SERVICE: MAIL_PORT existe:', !!process.env.MAIL_PORT);
      return;
    }
    
    console.log('✅ MAIL SERVICE: Servicio configurado, procediendo a enviar email...');

    // Generar la tabla de productos
    const productRows = products
      .map(
        (p) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">(${p.cantidad}) ${p.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$ ${p.price.toLocaleString('es-CL')}</td>
        </tr>
      `,
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #30393A;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header img {
      max-width: 150px;
      height: auto;
      margin-bottom: 15px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      color: white;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .info-section {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 600;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .products-table th {
      background-color: #f0f0f0;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      color: #555;
    }
    .products-table td {
      padding: 8px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #333;
    }
    .totals {
      margin-top: 20px;
      padding: 15px 0;
      border-top: 2px solid #eee;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .total-row.final {
      font-weight: 700;
      font-size: 16px;
      color: #ff6600;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      margin-top: 10px;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://espacioboulevardlinares.cl/logo.png" alt="Espacio Boulevard Logo" />
      <h1>¡Pedido confirmado!</h1>
    </div>
    
    <div class="content">
      <p class="greeting">
        Hola <strong>${customerName}</strong>, tu pedido fue confirmado y está próximo a prepararse.
      </p>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Pedido:</span>
          <span class="info-value">#${numeroVenta}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha:</span>
          <span class="info-value">${fecha}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tipo:</span>
          <span class="info-value">${orderType === 'delivery' ? 'Envío a domicilio' : orderType}</span>
        </div>
        ${customerAddress
        ? `
        <div class="info-row">
          <span class="info-label">Dirección:</span>
          <span class="info-value">${customerAddress}</span>
        </div>
        `
        : ''
      }
        ${tiempoEstimado
        ? `
        <div class="info-row">
          <span class="info-label">Tiempo estimado:</span>
          <span class="info-value">${tiempoEstimado}</span>
        </div>
        `
        : ''
      }
      </div>

      <table class="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align: right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>$ ${subtotal.toLocaleString('es-CL')}</span>
        </div>
        <div class="total-row">
          <span>Costo de envío</span>
          <span>$ ${costoEnvio.toLocaleString('es-CL')}</span>
        </div>
        <div class="total-row final">
          <span>Total</span>
          <span>$ ${total.toLocaleString('es-CL')}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Gracias por tu preferencia.</p>
      <p>Este es un correo automático, por favor no responder.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      console.log(`📤 MAIL SERVICE: Enviando email a ${customerEmail}...`);
      console.log('📧 MAIL SERVICE: Configuración del transporter:', {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER,
        hasPassword: !!process.env.MAIL_PASSWORD,
        mailFrom: process.env.MAIL_FROM || process.env.MAIL_USER,
      });
      
      const mailOptions = {
        from: `"Espacio Boulevard" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to: customerEmail,
        subject: `¡Pedido confirmado! #${numeroVenta}`,
        html: htmlContent,
      };
      
      console.log('📧 MAIL SERVICE: Opciones de email:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        htmlLength: mailOptions.html.length,
      });
      
      console.log('📧 MAIL SERVICE: Llamando a transporter.sendMail...');
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ MAIL SERVICE: Email enviado exitosamente: ${info.messageId}`);
      console.log('📧 MAIL SERVICE: Response info:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        envelope: info.envelope,
      });
    } catch (error) {
      console.error('❌ MAIL SERVICE: Error al enviar email:', error);
      console.error('❌ MAIL SERVICE: Error message:', error.message);
      console.error('❌ MAIL SERVICE: Error code:', error.code);
      console.error('❌ MAIL SERVICE: Error stack:', error.stack);
      // No lanzamos error para no interrumpir la creación de la orden
    }
  }
}

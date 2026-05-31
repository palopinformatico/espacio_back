import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { CustomerModule } from './customer/customer.module';
import { MesasModule } from './mesas/mesas.module';
import { GastosModule } from './gastos/gastos.module';
import { CategoriaGastoModule } from './categoria-gasto/categoria-gasto.module';
import { AuthModule } from './auth/auth/auth.module';
import { ProductsOrdersModule } from './products-orders/products-orders.module';
import { HorariosModule } from './horarios/horarios.module';
import { Horario } from './horarios/entities/horario.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';
import { OrdersGateway } from './orders/orders.gateway';
import { ThemeModule } from './theme/theme.module';
import { MailModule } from './mail/mail.module';
import { CostoEnvioModule } from './costo_envio/costo_envio.module';
import { TicketBarModule } from './ticket-bar/ticket-bar.module';
import { EtaModule } from './eta/eta.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { IngresoModule } from './ingresos/ingresos.module';
import { CategoriaIngresoModule } from './categoria_ingresos/categoria_ingresos.module';
import { ClienteIngresoModule } from './clientes_ingresos/clientes_ingresos.module';
// import { DocumentoIngresoModule } from './documentos_ingreso/documentos_ingreso.module'; // Módulo deshabilitado - tabla eliminada


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en toda la app
      envFilePath: '.env', // Ruta al archivo .env
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',//'usuario_node',
      password: '',//'-2#qFYnxyqyazxQN',
      database: 'prd_espacio-bl',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule, CategoriesModule, GastosModule, ProductsModule, OrdersModule, CustomerModule, MesasModule, GastosModule, CategoriaGastoModule, AuthModule, ProductsOrdersModule, HorariosModule, ThemeModule, MailModule, CostoEnvioModule, TicketBarModule, EtaModule, ProveedoresModule, IngresoModule, CategoriaIngresoModule, ClienteIngresoModule], // DocumentoIngresoModule deshabilitado
  controllers: [AppController],
  providers: [AppService, OrdersGateway],
})
export class AppModule { }

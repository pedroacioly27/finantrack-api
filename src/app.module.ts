import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (conficService: ConfigService) => ({
        type: 'postgres',

        host: conficService.get<string>('DB_HOST'),
        port: conficService.get<number>('DB_PORT'),
        username: conficService.get<string>('DB_USERNAME'),
        password: conficService.get<string>('DB_PASSWORD'),
        database: conficService.get<string>('DB_NAME'),

        autoLoadEntities: true,

        synchronize: false,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

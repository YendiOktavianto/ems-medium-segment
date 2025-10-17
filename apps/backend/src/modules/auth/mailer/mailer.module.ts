// apps/backend/src/modules/auth/mailer/mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AppMailerService } from './mailer.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        // Kandidat path: dist → src (monorepo & single-app)
        const candidates = [
          join(__dirname, 'templates'), // dist
          join(process.cwd(), 'src/modules/auth/mailer/templates'), // dev (apps/backend cwd)
          join(process.cwd(), 'apps/backend/src/modules/auth/mailer/templates'), // dev (kalau cwd project root)
        ];
        const templatesDir =
          candidates.find(
            (d) =>
              existsSync(join(d, 'reset-code.hbs')) && existsSync(join(d, 'password-changed.hbs')),
          ) ?? candidates[0];

        // (opsional) debug sementara
        // eslint-disable-next-line no-console
        console.log('[Mailer] templates dir =>', templatesDir);

        const host = cfg.get<string>('MAIL_HOST', 'localhost');
        const port = parseInt(cfg.get<string>('MAIL_PORT', '587'), 10);
        const secure = cfg.get<string>('MAIL_SECURE', 'false') === 'true';
        const user = cfg.get<string>('MAIL_USER');
        const pass = cfg.get<string>('MAIL_PASS');

        return {
          transport: {
            host,
            port,
            secure,
            auth: user && pass ? { user, pass } : undefined,
          },
          defaults: {
            from: `"${cfg.get('MAIL_FROM_NAME', 'No-Reply')}" <${cfg.get('MAIL_FROM_EMAIL', 'no-reply@example.com')}>`,
          },
          template: {
            dir: templatesDir,
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
          preview: false,
        };
      },
    }),
  ],
  providers: [AppMailerService],
  exports: [AppMailerService],
})
export class AppMailerModule {}

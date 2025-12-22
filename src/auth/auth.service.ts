import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma/prisma.service';
import { SupabaseService } from './supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda');
    }

    try {
      const data = await this.supabase.signUp(dto.email, dto.password);

      if (!data.user) {
        throw new Error('Kimlik doğrulama kullanıcısı oluşturulamadı');
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = await this.prisma.user.findUnique({
        where: { supabaseAuthId: data.user.id },
      });

      if (!user) {
        this.logger.error('Trigger failed to create user in public.users');
        throw new Error('Kullanıcı kaydı tamamlanamadı');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.role && { role: dto.role }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      this.logger.log(`Yeni kullanıcı kayıt oldu: ${updatedUser.email}`);

      const token = this.generateToken(updatedUser);

      return {
        user: updatedUser,
        token,
        message: 'Kayıt başarılı. Lütfen emailinizi kontrol ediniz.',
      };
    } catch (error) {
      this.logger.error('Kayıt başarısız', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new ConflictException(
        error.message || 'Kayıt sırasında bir hata oluştu',
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      const data = await this.supabase.signIn(dto.email, dto.password);

      if (!data.user) {
        throw new UnauthorizedException('Geçersiz kimlik bilgileri');
      }

      const user = await this.prisma.user.findUnique({
        where: { supabaseAuthId: data.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Kullanıcı sistemde bulunamadı');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Hesap pasif durumda');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      this.logger.log(`Kullanıcı giriş yaptı: ${user.email}`);

      const token = this.generateToken(user);

      return {
        user,
        token,
      };
    } catch (error) {
      this.logger.error('Giriş başarısız', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Giriş yapılırken bir hata oluştu');
    }
  }

  async resetPassword(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          message:
            'E-posta adresi mevcutsa, sıfırlama bağlantısı gönderilmiştir',
        };
      }

      await this.supabase.resetPassword(email);

      return {
        message:
          'E-posta adresi mevcutsa, sıfırlama bağlantısı gönderilmiştir',
      };
    } catch (error) {
      this.logger.error('Password reset failed', error);

      return {
        message:
          'E-posta adresi mevcutsa, sıfırlama bağlantısı gönderilmiştir',
      };
    }
  }

  private generateToken(user: { id: string; email: string; role: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
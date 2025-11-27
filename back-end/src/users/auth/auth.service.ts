/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { PasswordService } from '../password/password.service';
import { CreateUserDto } from '../dtos/createUser.dto';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RefreshResponse } from '../utils/refresh.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  public async registerUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  // Login do usuário que gera accessToken e refreshToken
  public async loginUser(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; selector: string; refreshToken: string }> {
    // Procurando o usuário pelo email
    const user = await this.usersService.findOneUserByEmail(loginDto.email);
    // Se não o achou lança um exceção
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    // se achou o usuário mas a senha está errada, lança uma exceção
    if (
      !(await this.passwordService.verify(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Gerando accessToken (curto prazo) - se email e senha estão corretos
    const accessToken = await this.generateToken(user);

    // Se o selector e refreshToken(longo prazo) forem fornecidos, tenta reutilizar o refreshToken(longo prazo)
    if (loginDto.selector && loginDto.refreshToken) {
      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { selector: loginDto.selector },
        relations: ['user'],
      });

      if (tokenRecord) {
        // Verifica se o refreshToken enviado corresponde ao hash armazenado
        const isValid = await bcrypt.compare(
          loginDto.refreshToken,
          tokenRecord.tokenHash,
        );

        if (isValid && tokenRecord.expiresAt > new Date()) {
          // O refreshToken é válido e não expirou, reutilizamos o selector e refreshToken
          return {
            accessToken,
            selector: tokenRecord.selector,
            refreshToken: loginDto.refreshToken, // Retorna o refreshToken enviado (sem precisar gerar um novo)
          };
        }
      }

      // Caso o refreshToken ou o selector não sejam válidos ou tenham expirado, vamos gerar um novo refreshToken
      // Aqui, geramos um novo refreshToken porque o antigo não é válido
      const { selector: newSelector, refreshToken: newRefreshToken } =
        await this.generateRefreshToken(user);

      return {
        accessToken,
        selector: newSelector,
        refreshToken: newRefreshToken,
      };
    }

    const { selector: newSelector, refreshToken: newRefreshToken } =
      await this.generateRefreshToken(user);

    return {
      accessToken,
      selector: newSelector,
      refreshToken: newRefreshToken,
    };
  }

  // Logout - removendo refreshToken pelo selector
  public async logoutUser(selector: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { selector },
    });
    if (!refreshToken)
      throw new UnauthorizedException(
        'Refresh token not found or already revoked',
      );
    await this.refreshTokenRepository.remove(refreshToken);
    return { message: 'Logged out sucessfully' };
  }

  // ROTA DE REFRESH COM SELECTOR
  public async refreshToken(
    selector: string,
    oldToken: string,
  ): Promise<{ accessToken: string; selector: string; refreshToken: string }> {
    // Procura o RefreshToke, se achou, ja carrega os dados do usuario desse refreshToken, que podem ser usados futuramente.
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { selector },
      relations: ['user'],
    });
    if (!tokenRecord) throw new UnauthorizedException('Invalid refresh token.');
    console.log('Token record found: ', tokenRecord);
    const isValid = await bcrypt.compare(oldToken, tokenRecord.tokenHash);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token.');
    if (tokenRecord.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token expired');
    // Como todos os passos anteriores validou o refreshToken, gera um novo accessToken que mantem o usuário logado ate o refreshToken expirar(duração de 7 dias)
    const accessToken = this.generateToken(tokenRecord.user);
    // gerar novo refresh token e remover o antigo
    await this.refreshTokenRepository.remove(tokenRecord);
    const newRefreshToken = await this.generateRefreshToken(tokenRecord.user);
    return {
      accessToken: accessToken,
      selector: newRefreshToken.selector,
      refreshToken: newRefreshToken.refreshToken,
    };
  }

  // Gera accessToken
  private generateToken(user: User): string {
    const payload = { sub: user.id, name: user.name };
    return this.jwtService.sign(payload);
  }

  // ---- METODOS PRIVADOS --- //
  // Gera refreshToken
  private async generateRefreshToken(user: User): Promise<RefreshResponse> {
    const refreshToken = crypto.randomBytes(24).toString('base64'); // token aleatorio
    const selector = crypto.randomUUID(); // selector único público
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 Dia de validade
    const tokenEntity = this.refreshTokenRepository.create({
      selector,
      tokenHash,
      user,
      expiresAt,
    });
    await this.refreshTokenRepository.save(tokenEntity);
    return { selector, refreshToken };
  }
}

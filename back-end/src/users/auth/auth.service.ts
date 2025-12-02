/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
    // essa const 'accessToken' recebe o payload que tem o id e nome do usuário
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
    // ------------------------------------------
    // PROCURANDO REFRESH TOKEN NO BANCO DE DADOS
    // ------------------------------------------
    console.log(
      `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] PROCURANDO REFRESH TOKEN NO BANCO DE DADOS ---`,
    );
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { selector },
      relations: ['user'],
    });

    // ----------------------------------------------
    // REFRESH TOKEN NÃO ENCONTRADO NO BANCO DE DADOS
    // ----------------------------------------------
    if (!tokenRecord) {
      console.log(
        `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] REFRESH TOKEN NÃO ENCONTRADO NO BANCO DE DADOS`,
      );
      throw new UnauthorizedException('Invalid refresh token.');
    }

    // ----------------
    // TOKEN ENCONTRADO
    // ----------------
    console.log(
      `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] REFRESH TOKEN ENCONTRADO\nREFRESH TOKEN ID: ${tokenRecord.id}\nREFRESH TOKEN SELECTOR: ${tokenRecord.selector}\nREFRESH TOKEN USERID: ${tokenRecord.user.id}\nREFRESH TOKEN EXPIRAÇÃO: ${tokenRecord.expiresAt}`,
    );

    // ---------------
    // VALIDANDO TOKEN
    // ---------------
    console.log(
      `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] VALIDANDO REFRESH TOKEN`,
    );
    const isValid = await bcrypt.compare(oldToken, tokenRecord.tokenHash);

    // ------------------------
    // REFRESH TOKEN INVÁLIDO
    // -------------------------
    if (!isValid) {
      console.log(
        `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] REFRESH TOKEN INVÁLIDO`,
      );
      throw new UnauthorizedException('Invalid refresh token.');
    }

    // --------------------------------------
    // TESTANDO SE REFRESH TOKEN EXPIROU
    // --------------------------------------
    if (tokenRecord.expiresAt < new Date()) {
      console.log(
        `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] REFRESH TOKEN EXPIRADO, FAÇA LOGIN NOVAMENTE ---`,
      );
      throw new UnauthorizedException('Refresh token expired');
    }

    console.log(`[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] REFRESH TOKEN VÁLIDO`);

    // -------------------------
    // GERANDO NOVO ACCESS TOKEN
    // -------------------------
    console.log(
      `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] GERANDO NOVO ACCESS TOKEN`,
    );
    const accessToken = this.generateToken(tokenRecord.user);

    // ----------------------------
    // RETORNANDO NOVO ACCESS TOKEN
    // ----------------------------
    console.log(
      `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] RETORNANDO NOVO ACCESS TOKEN`,
    );
    return {
      accessToken: accessToken,
      selector: tokenRecord.selector,
      refreshToken: oldToken,
    };
  }

  // Gera accessToken
  private generateToken(user: User): string {
    const payload = { sub: user.id, name: user.name };
    console.log(
      `[BACK - SRC/USERS/AUTH/AUTH.SERVICE.TS] NOVO ACCESS TOKEN GERADO`,
    );
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

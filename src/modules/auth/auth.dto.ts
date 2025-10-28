import { TypeToken } from './auth.enum';

export interface LoginDto {
	email: string;
	password: string;
}

export interface RegisterDto {
	email: string;
	password: string;
	name: string;
}

export interface VerifyAccountDto {
	userId: string;
	code: string;
}

export interface RefreshTokenDto {
	refreshToken: string;
}

export interface ForgotPasswordDto {
	email: string;
}

export interface ResetPasswordDto {
	token: string;
	newPassword: string;
}

export interface VerifyResetCodeDto {
	userId: string;
	code: string;
}

export interface IAuthToken {
	accessToken: string;
	refreshToken: string;
}

export interface IAuthPayload {
	sub: string;
	email: string;
	roles?: string[];
	permissions?: string[];
	type: TypeToken;
}

export interface IVerificationCode {
	userId: string;
	code: string;
	expiredAt: number;
}

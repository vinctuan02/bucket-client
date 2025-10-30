import { ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';
import {
	ForgotPasswordDto,
	IAuthToken,
	LoginDto,
	RefreshTokenDto,
	RegisterDto,
	ResetPasswordDto,
	VerifyAccountDto,
	VerifyResetCodeDto,
} from './auth.dto';

const BASE_URL = '/auth';

export const authApi = {
	login: async (data: LoginDto) => {
		const res = await api.post<ResponseSuccess<IAuthToken>>(
			`${BASE_URL}/login`,
			data,
		);
		return res.data;
	},

	register: async (data: RegisterDto) => {
		const res = await api.post<ResponseSuccess<any>>(
			`${BASE_URL}/register`,
			data,
		);
		return res.data;
	},

	verifyEmail: async (data: VerifyAccountDto) => {
		const res = await api.post<ResponseSuccess<any>>(
			`${BASE_URL}/verify-email`,
			data,
		);
		return res.data;
	},

	refreshToken: async (data: RefreshTokenDto) => {
		const res = await api.post<ResponseSuccess<{ access_token: string }>>(
			`${BASE_URL}/refresh-token`,
			data,
		);
		return res.data;
	},

	forgotPassword: async (data: ForgotPasswordDto) => {
		const res = await api.post<ResponseSuccess<any>>(
			`${BASE_URL}/forgot-password`,
			data,
		);
		return res.data;
	},

	verifyResetCode: async (data: VerifyResetCodeDto) => {
		const res = await api.post<ResponseSuccess<any>>(
			`${BASE_URL}/verify-reset-code`,
			data,
		);
		return res.data;
	},

	resetPassword: async (data: ResetPasswordDto) => {
		const res = await api.post<ResponseSuccess<any>>(
			`${BASE_URL}/reset-password`,
			data,
		);
		return res.data;
	},

	googleLogin: () => {
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
	},

	me: () => api.get('/auth/me'),
};

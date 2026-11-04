import { request } from './api.js'

export const EMAIL_OTP_PURPOSE = {
  VERIFICATION: 'EMAIL_VERIFICATION',
  LOGIN: 'LOGIN_VERIFICATION',
}

export const authApi = {
  /** POST /api/auth/send-email-otp — register: purpose EMAIL_VERIFICATION (no password) */
  sendEmailOtp: (payload) =>
    request('/auth/send-email-otp', { method: 'POST', body: payload }),

  /** POST /api/auth/verify-email-otp */
  verifyEmailOtp: (payload) =>
    request('/auth/verify-email-otp', { method: 'POST', body: payload }),

  /** POST /api/auth/register — otp + form fields */
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload }),

  /** Preferred login OTP */
  sendLoginOtp: (payload) =>
    request('/auth/send-login-otp', { method: 'POST', body: payload }),

  resendLoginOtp: (payload) =>
    request('/auth/resend-login-otp', { method: 'POST', body: payload }),

  /** POST /api/auth/login — email + password + otp */
  login: (payload) =>
    request('/auth/login', { method: 'POST', body: payload }),

  sendForgotPasswordOtp: (payload) =>
    request('/auth/forgot-password/send-otp', { method: 'POST', body: payload }),

  /** POST /api/auth/forgot-password/verify-otp */
  verifyForgotPasswordOtp: (payload) =>
    request('/auth/forgot-password/verify-otp', { method: 'POST', body: payload }),

  /** Optional resend — falls back to send-otp on the client if unused */
  resendForgotPasswordOtp: (payload) =>
    request('/auth/forgot-password/resend-otp', { method: 'POST', body: payload }),

  /** POST /api/auth/forgot-password/reset */
  resetPassword: (payload) =>
    request('/auth/forgot-password/reset', { method: 'POST', body: payload }),
}

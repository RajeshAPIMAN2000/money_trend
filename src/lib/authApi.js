import { request } from './api.js'

export const authApi = {
  // OTP register — commented out (password-only registration)
  // sendRegisterOtp: (payload) =>
  //   request('/auth/register/send-otp', { method: 'POST', body: payload }),
  // resendRegisterOtp: (payload) =>
  //   request('/auth/register/resend-otp', { method: 'POST', body: payload }),

  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload }),

  // OTP login — commented out (password-only login)
  // sendLoginOtp: (payload) =>
  //   request('/auth/login/send-otp', { method: 'POST', body: payload }),
  // resendLoginOtp: (payload) =>
  //   request('/auth/login/resend-otp', { method: 'POST', body: payload }),

  login: (payload) =>
    request('/auth/login', { method: 'POST', body: payload }),

  sendForgotPasswordOtp: (payload) =>
    request('/auth/forgot-password/send-otp', { method: 'POST', body: payload }),

  resendForgotPasswordOtp: (payload) =>
    request('/auth/forgot-password/resend-otp', { method: 'POST', body: payload }),

  resetPassword: (payload) =>
    request('/auth/forgot-password/reset', { method: 'POST', body: payload }),
}

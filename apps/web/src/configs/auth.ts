export default {
  meEndpoint: '/auth/me',

  // loginEndpoint: '/jwt/login',
  loginEndpoint: '/auth/login',
  googleLoginEndpoint: '/auth/google',
  registerEndpoint: '/auth/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken', // logout | refreshToken
};

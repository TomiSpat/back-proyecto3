// config.ts
export default () => {
  const sameSiteEnv = process.env.COOKIE_SAME_SITE;

  const sameSite: 'strict' | 'lax' | 'none' =
    sameSiteEnv === 'strict' || sameSiteEnv === 'lax' || sameSiteEnv === 'none'
      ? sameSiteEnv
      : 'strict'; // valor por defecto si no es válido

  return {
    jwt: {
      secretAuth: process.env.JWT_SECRET_AUTH,
      secretRefresh: process.env.JWT_SECRET_REFRESH,
      secretEmailVerification: process.env.JWT_SECRET_EMAIL_VERIFICATION,
      secretPasswordReset: process.env.JWT_SECRET_PASSWORD_RESET,
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
      accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION,
      refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION,
      emailVerificationTokenExpiration: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION,
      resetPasswordTokenExpiration: process.env.RESET_PASSWORD_TOKEN_EXPIRATION,
    },
    db: {
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '27017'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      schema: process.env.DB_SCHEMA,
    },
    cookies: {
      secure: process.env.COOKIE_SECURE === 'true',
      httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
      sameSite,
      domain: process.env.COOKIE_DOMAIN || undefined, //falta implementar
    },
    app: {
      env: process.env.NODE_ENV,//falta implementar
      port: process.env.PORT,
    },
    cors: {
      origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),//falta implementar
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),//falta implementar
    },
    csrf: {
      secret: process.env.CSRF_SECRET,//falta implementar
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/usuario/google/callback',
    }
  };
};

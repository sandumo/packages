import { Response } from 'express';

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    // secure: NODE_ENV === 'production' ? true : false,
    sameSite: 'lax',
  });
};

export const removeAccessTokenCookie = (res: Response) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    // secure: NODE_ENV === 'production' ? true : false,
    sameSite: 'lax',
  });
};

import type { Request, Response, NextFunction } from 'express';
// Local maintenance boundary, not a remote staff login. Never trust proxy headers here.
export function localManagement(req: Request, res: Response, next: NextFunction) {
  const ip = req.socket.remoteAddress;
  const host = req.headers.host || '';
  const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
  const localIp = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  const origin = req.headers.origin;
  if (!localHost || !localIp || req.headers['x-forwarded-for'] || req.headers.forwarded || origin && origin !== `${req.protocol}://${host}` || req.headers['sec-fetch-site'] === 'cross-site') {
    res.status(403).json({
      error: 'Administration is available only locally. Remote access is disabled.'
    });
    return;
  }
  next();
}

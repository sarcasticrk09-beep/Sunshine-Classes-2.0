import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './AuthMiddleware';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User authentication required.' });
    }

    const userRole = (req.user.role || '').toUpperCase().replace('-', '_');
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace('-', '_'));

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ error: `Forbidden: Access restricted for role ${req.user.role}.` });
    }

    next();
  };
}

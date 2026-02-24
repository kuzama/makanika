import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { MockWhatsAppService } from '../services/whatsapp.service';
import { requireAuth } from '../middleware/auth.middleware';
import prisma from '../models/prisma';

const router = Router();

const whatsappService = new MockWhatsAppService();
const authService = new AuthService(prisma as any, whatsappService);

export function getAuthService(): AuthService {
  return authService;
}

router.post('/send-code', async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  const result = await authService.sendVerificationCode(phone);

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({ success: true, message: 'Verification code sent' });
});

router.post('/verify', async (req: Request, res: Response) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    res.status(400).json({ error: 'Phone and code are required' });
    return;
  }

  const result = await authService.verifyCode(phone, code);

  if (!result.success) {
    res.status(401).json({ error: result.error });
    return;
  }

  res.json({ success: true, token: result.token, user: result.user });
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

export default router;

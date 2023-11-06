import { Router } from 'express';
import { verifyToken } from '../utils/tokens.js';
import { chatCompletionValidator, validate } from '../utils/validators.js';
import { generateChatCompletion } from '../controllers/chatController.js';

const chatRouter = Router();

chatRouter.post(
  '/new',
  verifyToken,
  validate(chatCompletionValidator),
  generateChatCompletion
);

export default chatRouter;

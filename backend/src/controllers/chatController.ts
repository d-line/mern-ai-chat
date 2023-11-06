import { NextFunction, Request, Response } from 'express';
import User from '../models/User.js';
import { configureOpenAI } from '../config/openai.js';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      res.status(401).json({
        message: 'ERROR',
        cause: 'User not registered OR Token malfunctioned',
      });
    }
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionMessageParam[];
    chats.push({ content: message, role: 'user' });
    user.chats.push({ content: message, role: 'user' });

    const config = configureOpenAI();
    const openai = new OpenAI(config as any);
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chats,
    });
    user.chats.push(chatResponse.choices[0].message);
    await user.save();
    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error })
  }
};

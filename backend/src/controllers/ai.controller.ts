import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../config/logger';

export const transcribeAudio = async (req: Request, res: Response) => {
  const { mediaUrl } = req.body;

  if (!mediaUrl || typeof mediaUrl !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_MEDIA_URL', message: 'mediaUrl é obrigatório e deve ser uma string.' }
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    logger.error('Neither GEMINI_API_KEY nor GOOGLE_GEMINI_API_KEY is defined in environment variables.');
    return res.status(500).json({
      success: false,
      error: { code: 'API_KEY_NOT_CONFIGURED', message: 'Chave de API do Gemini não configurada.' }
    });
  }

  let downloadUrl = '';
  try {
    downloadUrl = mediaUrl;
    logger.info(`Downloading audio from: ${mediaUrl}`);
    // Baixa o áudio como Buffer
    const downloadResponse = await axios.get(mediaUrl, {
      responseType: 'arraybuffer'
    });
    const buffer = Buffer.from(downloadResponse.data);
    const base64Audio = buffer.toString('base64');

    const model = process.env.AI_PRIMARY_MODEL || 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'audio/ogg',
                data: base64Audio
              }
            },
            {
              text: 'Transcreva este áudio do WhatsApp da forma mais fiel possível. Se for uma transação financeira (ex: \'gastei 50 reais\'), garanta que o valor e o item estejam claros.'
            }
          ]
        }
      ]
    };

    logger.info(`Sending audio to Gemini API...`);
    downloadUrl = 'Gemini API'; // Marcar que falhou no Gemini a partir daqui
    const geminiResponse = await axios.post(geminiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const transcription = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    logger.info(`Gemini response received. Transcription: "${transcription}"`);

    return res.json({
      success: true,
      transcricao: transcription.trim()
    });

  } catch (error: any) {
    const errorMsg = error.response?.data
      ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
      : error.message;
    logger.error(`Error in transcribeAudio at [${downloadUrl}]: ${errorMsg}`);
    return res.status(500).json({
      success: false,
      error: { 
        code: 'TRANSCRIBE_FAILED', 
        message: `Failed at [${downloadUrl}]: ${errorMsg}` 
      }
    });
  }
};

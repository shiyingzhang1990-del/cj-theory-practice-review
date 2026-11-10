import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { reviewPaper } from './review-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.txt', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件格式: ${ext}，仅支持 .txt / .docx`));
    }
  },
});

const mammothPromise = import('mammoth').then(m => m.default);

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    let text = '';

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === '.txt') {
        text = req.file.buffer.toString('utf-8');
      } else if (ext === '.docx' || ext === '.doc') {
        const mammoth = await mammothPromise;
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
      }
    }

    if (!text || text.trim().length < 300) {
      return res.status(400).json({
        error: '论文内容不足，请确保上传的论文至少有300字。',
      });
    }

    const report = reviewPaper(text, req.file?.originalname || 'unknown');
    return res.json({ text, report, fileName: req.file?.originalname || 'unknown' });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: `处理文件时出错: ${err.message}` });
  }
});

// Text review endpoint
app.post('/api/review', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 300) {
      return res.status(400).json({
        error: '论文内容不足，请确保论文至少有300字。',
      });
    }
    const report = reviewPaper(text, 'pasted');
    return res.json({ text, report, fileName: '手动粘贴' });
  } catch (err) {
    console.error('Review error:', err);
    return res.status(500).json({ error: `评审时出错: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`📊 财经理论与实践审稿引擎已启动: http://localhost:${PORT}`);
});

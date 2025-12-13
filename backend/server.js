import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { analyzeProduct } from './geminiClient.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(join(__dirname, '../frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chemical Safety Hub API is running' });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { productName } = req.body;

    // Input validation
    if (!productName || typeof productName !== 'string') {
      return res.status(400).json({ 
        error: 'Product name is required' 
      });
    }

    // Check length
    if (productName.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Product name is too short' 
      });
    }

    if (productName.length > 100) {
      return res.status(400).json({ 
        error: 'Product name is too long' 
      });
    }

    // Filter suspicious keywords
    const suspiciousTerms = ['bomb', 'explosive', 'weapon', 'poison', 'synthesis'];
    const lowerProduct = productName.toLowerCase();
    if (suspiciousTerms.some(term => lowerProduct.includes(term))) {
      return res.status(400).json({ 
        error: 'Unable to analyze this product' 
      });
    }

    // Call Gemini API
    const result = await analyzeProduct(productName);

    res.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error.message);
    
    res.status(500).json({ 
      error: 'Unable to analyze product at the moment. Please try again later.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Chemical Safety Hub running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/analyze`);
});


const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// Define onde os comprovantes serão salvos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/assets/comprovantes'));
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `comprovante-${timestamp}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Rota principal - Página inicial com os e-books
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Rota de "obrigado"
router.get('/obrigado', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/obrigado.html'));
});

// Rota de envio do comprovante
router.post('/enviar-comprovante', upload.single('comprovante'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Erro: Nenhum comprovante foi enviado.');
  }

  // Aqui você pode adicionar lógica adicional (ex: salvar log, notificar por email, etc.)
  console.log(`Comprovante recebido: ${req.file.filename}`);

  res.redirect('/obrigado');
});

module.exports = router;

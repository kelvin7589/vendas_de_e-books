const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const auth = require('basic-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Express para servir arquivos estáticos
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configurar armazenamento dos comprovantes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public', 'assets', 'comprovantes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `comprovante-${timestamp}${ext}`);
  }
});
const upload = multer({ storage: storage });

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Página de obrigado
app.get('/obrigado', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'obrigado.html'));
});

// Upload de comprovante
app.post('/enviar-comprovante', upload.single('comprovante'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }
  res.redirect('/obrigado');
});

// Middleware de autenticação básica para o admin
const checkAuth = (req, res, next) => {
  const user = auth(req);
  const senhaCorreta = process.env.ADMIN_PASSWORD;

  if (user && user.name === 'admin' && user.pass === senhaCorreta) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Painel Administrativo"');
    res.status(401).send('Autenticação necessária.');
  }
};

// Painel admin
app.get('/admin', checkAuth, (req, res) => {
  const comprovantesDir = path.join(__dirname, 'public', 'assets', 'comprovantes');

  fs.readdir(comprovantesDir, (err, files) => {
    if (err) {
      return res.status(500).send('Erro ao listar comprovantes.');
    }

    const lista = files
      .filter(file => /\.(png|jpg|jpeg|pdf)$/i.test(file))
      .map(file => `<li><a href="/assets/comprovantes/${file}" target="_blank">${file}</a></li>`)
      .join('');

    const html = `
      <h2>Comprovantes recebidos:</h2>
      <ul>${lista}</ul>
    `;
    res.send(html);
  });
});

// Download de e-book (protegido)
app.get('/download/:ebook', checkAuth, (req, res) => {
  const fileName = req.params.ebook;
  const filePath = path.join(__dirname, 'private', 'ebooks', fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('E-book não encontrado.');
  }

  res.download(filePath);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

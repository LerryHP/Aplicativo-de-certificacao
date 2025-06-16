const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
/*const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);*/
const db = require('./db'); // conexão com MySQL

const app = express();
app.use(cors({origin: 'http://127.0.0.1:5500', credentials: true, methods: ['GET', 'POST']}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // para acessar imagens salvas
/*app.use(session({
  secret: process.env.SESSION_SECRET || 'uma_chave_secreta_qualquer',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 dia
    sameSite: 'lax',  // importante para cookies em requisições cross-origin
    secure: false
  }
})); //1dia de sessao*/



// Configuração do Multer //
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload de tênis com imagens //
app.post('/upload-sneaker', upload.fields([
  { name: 'topo_sapato', maxCount: 1 },
  { name: 'sola', maxCount: 1 },
  { name: 'lingua', maxCount: 1 },
  { name: 'lado', maxCount: 1 },
  { name: 'caixa', maxCount: 1 }
]), async (req, res) => {
  try {
    const { estado, modelo, numero, message } = req.body;

    // Verificar se os campos estão preenchidos
    if (!estado || !modelo || !numero || !message) {
      return res.status(400).json({ success: false, mensagem: 'Campos obrigatórios faltando.' });
    }

    // Verificar se os arquivos foram enviados
    const topoUrl = req.files['topo_sapato'] ? req.files['topo_sapato'][0].path : '';
    const solaUrl = req.files['sola'] ? req.files['sola'][0].path : '';
    const linguaUrl = req.files['lingua'] ? req.files['lingua'][0].path : '';
    const ladoUrl = req.files['lado'] ? req.files['lado'][0].path : '';
    const caixaUrl = req.files['caixa'] ? req.files['caixa'][0].path : '';

    const sql = `
      INSERT INTO tenis (marca, modelo, numero, mensagem, topo_url, sola_url, lingua_url, lado_url, caixa_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    await db.query(sql, [
      estado,
      modelo,
      numero,
      message,
      topoUrl,
      solaUrl,
      linguaUrl,
      ladoUrl,
      caixaUrl
    ]);

    res.json({ success: true, mensagem: 'Dados e imagens salvos com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar dados:', err.message);
    res.status(500).json({ success: false, mensagem: 'Erro ao salvar os dados.' });
  }
});

// FORM HTML //
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// CADASTRO //
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  const sql = 'INSERT INTO usuarios (nome, email, senha, moedas) VALUES (?, ?, ?, ?)';
  try {
    const [result] = await db.query(sql, [nome, email, senha, 0]);
    res.json({ success: true, mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar:', err);
    res.status(500).json({ success: false, mensagem: 'Erro ao cadastrar o usuário.' });
  }
});


//login//
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);

    if (rows.length > 0) {
      const usuario = {
        id: rows[0].id,
        nome: rows[0].nome,
        email: rows[0].email,
        moedas: rows[0].moedas
      };
      
      console.log('Login realizado!', usuario); // ADICIONE ISSO para depurar

      res.json({ success: true, mensagem: 'Login realizado com sucesso!', usuario});
    } else {
      res.status(401).json({ success: false, mensagem: 'Email ou senha incorretos' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, mensagem: 'Erro no servidor' });
  }
});




//  ENVIAR EMAIL //
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'verifiqoficial@gmail.com',
      pass: 'hshk ugkr vuds vhmy'
    }
  });

  const mailOptions = {
    from: 'verifiqoficial@gmail.com',
    to: 'verifiqoficial@gmail.com',
    subject: `Nova mensagem de contato - VerifiQ`,
    text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, mensagem: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ success: false, mensagem: 'Erro ao enviar o e-mail.' });
  }
});


/*
// ROTA DE PAGAMENTO //
app.post('/criar-checkout', async (req, res) => {
  const { userId, priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `http://localhost:3000/sucesso?userId=${userId}&priceId=${priceId}`,
      cancel_url: `http://localhost:3000/cancelado`,
    });

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).send('Erro ao criar sessão de pagamento');
  }
});



// Sucesso //

app.get('/sucesso', (req, res) => {
  const { userId, priceId } = req.query;

  // Relacionamento priceId ↔ moedas
  const valoresMoedas = {
    'prod_SJH14ckV271dqy': 10,
    'prod_SJH1ZseBQ5ht12': 25,
    'prod_SJH2CQyvw11aYB': 35,
    'prod_SJH28aeQpZra91': 70,
  };

  const moedas = valoresMoedas[priceId] || 0;

  const sql = 'UPDATE usuarios SET moedas = moedas + ? WHERE id = ?';
  db.query(sql, [moedas, userId], (err) => {
    if (err) return res.status(500).send('Erro ao adicionar moedas');
    res.send('Pagamento concluído! Moedas adicionadas.');
  });
});


*/

// === INICIAR SERVIDOR === //
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

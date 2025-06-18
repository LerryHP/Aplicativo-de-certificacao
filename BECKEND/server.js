const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const db = require('./db'); // conexão com MySQL




const app = express();
app.use(cors({origin: 'http://127.0.0.1:5500', credentials: true, methods: ['GET', 'POST']}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // para acessar imagens salvas
app.use(express.static(path.join(__dirname, 'FRONTEND')));




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



app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);

        if (rows.length > 0) {
            const usuarioLogado = { 
                id: rows[0].id,
                nome: rows[0].nome,
                email: rows[0].email,
                moedas: rows[0].moedas,
                isAdmin: false // Define como falso por padrão
            };


            const ID_ADMINISTRADOR = 4;

            if (usuarioLogado.id === ID_ADMINISTRADOR) {
                usuarioLogado.isAdmin = true; // Se for o admin, define como true
            }

            console.log('Login realizado!', usuarioLogado);

            // Envia as informações do usuário, incluindo isAdmin
            res.json({ success: true, mensagem: 'Login realizado com sucesso!', usuario: usuarioLogado });
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



app.post('/adicionar-moedas-simulado', async (req, res) => {
    const { userId, moedas } = req.body;

    if (!userId || moedas === undefined || moedas < 0) {
        return res.status(400).json({ success: false, mensagem: 'Dados inválidos para adicionar moedas.' });
    }

    try {
        // Atualiza as moedas do usuário no banco de dados
        const sql = 'UPDATE usuarios SET moedas = moedas + ? WHERE id = ?';
        await db.query(sql, [moedas, userId]);

        // Opcional: Buscar o novo total de moedas para retornar ao frontend
        const [rows] = await db.query('SELECT moedas FROM usuarios WHERE id = ?', [userId]);
        const novasMoedas = rows.length > 0 ? rows[0].moedas : 0;

        res.json({ 
            success: true, 
            mensagem: `Adicionado ${moedas} moedas com sucesso! Total: ${novasMoedas}`,
            novasMoedas: novasMoedas // Retorna o novo total de moedas
        });

    } catch (error) {
        console.error('Erro ao adicionar moedas simuladas:', error);
        res.status(500).json({ success: false, mensagem: 'Erro no servidor ao adicionar moedas.' });
    }
});



// === INICIAR SERVIDOR === //
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

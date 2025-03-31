const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();

// Configuração de CORS
app.use(cors());

// Configuração para o Frontend acessar via API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Criação do banco de dados SQLite e das tabelas
const db = new sqlite3.Database('./uploadsApp.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao SQLite');
    }
});

// Criar tabela de usuários, se não existir
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT DEFAULT 'user'
    )
`);

// Criar tabela de imagens, se não existir
db.run(`
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        dateUploaded DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rota para criação de usuário
app.post('/api/register', (req, res) => {
    const { username, password, email } = req.body;

    // Verificar se o usuário já existe
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao verificar usuário existente.' });
        }
        if (row) {
            return res.status(400).json({ message: 'Usuário já existe.' });
        }

        // Inserir novo usuário no banco
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], function (err) {
            if (err) {
                return res.status(500).json({ message: 'Erro ao criar usuário.' });
            }
            res.status(201).json({ message: 'Usuário criado com sucesso!' });
        });
    });
});

// Rota de login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Verifica se o usuário e senha são 'admin'
    if (username === 'admin' && password === 'admin') {
        return res.status(200).json({ message: 'Login bem-sucedido', role: 'admin' });
    }

    // Caso contrário, verifica no banco de dados
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao realizar o login.' });
        }
        if (!row) {
            return res.status(400).json({ message: 'Usuário ou senha incorretos.' });
        }
        res.status(200).json({ message: 'Login bem-sucedido', role: row.role });
    });
});

// Rota para upload de imagens
app.post('/api/upload', upload.single('image'), (req, res) => {
    const email = req.body.email;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Inserir imagem no banco de dados
    db.run('INSERT INTO images (email, imageUrl) VALUES (?, ?)', [email, imageUrl], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao salvar imagem.' });
        }
        res.status(200).json({ message: 'Imagem enviada com sucesso!', imageUrl });
    });
});

// Rota para exibir todas as imagens para o admin
app.get('/api/images', (req, res) => {
    db.all('SELECT * FROM images', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao carregar imagens.' });
        }
        res.status(200).json(rows);
    });
});

// Servir as imagens estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

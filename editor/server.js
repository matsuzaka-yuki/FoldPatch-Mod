const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 允许编辑的文件列表
const ALLOWED_FILES = ['apm.json', 'kpm.json'];
const BASE_DIR = path.join(__dirname, '..');

// 获取允许的文件列表
app.get('/api/files', (req, res) => {
    res.json(ALLOWED_FILES);
});

// 获取文件内容
app.get('/api/content/:filename', (req, res) => {
    const filename = req.params.filename;
    if (!ALLOWED_FILES.includes(filename)) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(BASE_DIR, filename);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // 如果文件不存在，返回空数组
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            return res.status(500).json({ error: 'Failed to read file' });
        }
        try {
            const json = JSON.parse(data);
            res.json(json);
        } catch (parseErr) {
            res.status(500).json({ error: 'Invalid JSON file' });
        }
    });
});

// 保存文件内容
app.post('/api/content/:filename', (req, res) => {
    const filename = req.params.filename;
    const content = req.body;

    if (!ALLOWED_FILES.includes(filename)) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(BASE_DIR, filename);

    // 简单的验证：必须是数组
    if (!Array.isArray(content)) {
         return res.status(400).json({ error: 'Content must be a JSON array' });
    }

    fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write file' });
        }
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

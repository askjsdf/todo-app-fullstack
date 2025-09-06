import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { testConnection, query } from './database.js';

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - 解析JSON请求体
app.use(express.json());
app.use(cors());

// 测试数据库连接
testConnection();

// 健康检查API
app.get('/health', (req, res) => {
  res.json({
    message: 'Todo API服务器运行正常！',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'PostgreSQL已连接'
  });
});

// 获取所有todos - 从数据库读取
app.get('/api/todos', async (req, res) => {
  try {
    const result = await query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('获取todos失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建新todo - 保存到数据库
app.post('/api/todos', async (req, res) => {
    try {
      const { title, category, completed = false } = req.body;

      // 验证必需字段
      if (!title || !category) {
        return res.status(400).json({ error: '标题和分类不能为空' });
      }

      // 插入到数据库
      const result = await query(
        'INSERT INTO todos (title, completed, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
        [title, completed]
      );

      // 返回新创建的任务
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('创建todo失败:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  });

 // 删除todo - 从数据库删除
 app.delete('/api/todos/:id', async (req, res) => {
    try {
      const todoId = parseInt(req.params.id);

      if (isNaN(todoId)) {
        return res.status(400).json({ error: '无效的任务ID' });
      }

      // 从数据库删除
      const result = await query(
        'DELETE FROM todos WHERE id = $1 RETURNING *',
        [todoId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '任务不存在' });
      }

      res.json({ message: '删除成功', deletedTodo: result.rows[0] });
    } catch (error) {
      console.error('删除todo失败:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  });

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功！`);
  console.log(`📡 访问地址: http://localhost:${PORT}`);
  console.log(`🌍 生产环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
  console.log(`📋 Todo API: http://localhost:${PORT}/api/todos`);
});
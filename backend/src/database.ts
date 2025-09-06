import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

// 数据库连接配置
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
} : {
    user: process.env.DB_USER || 'todouser',
    password: process.env.DB_PASSWORD || 'todopass',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'todoapp',
    port: parseInt(process.env.DB_PORT || '5432'),
  };

// 创建连接池
export const pool = new Pool(dbConfig);

// 创建todos表的SQL
const createTodosTable = `
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// 测试连接并创建表函数
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL连接成功！');
    
    // 自动创建表
    await client.query(createTodosTable);
    console.log('✅ todos表创建/验证成功！');
    
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL连接失败:', error);
  }
};

// 数据库查询函数
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};
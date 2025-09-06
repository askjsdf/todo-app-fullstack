# 使用官方Node.js 18镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制backend的package文件
COPY backend/package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制backend源代码
COPY backend/ ./

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
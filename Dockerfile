# --- 第一阶段：构建 (Builder) ---
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 开启 Corepack 以启用 pnpm (Node 16.13+ 内置)
# 或者手动安装: RUN npm install -g pnpm
RUN corepack enable

# 先只复制依赖文件，利用 Docker 缓存加速构建
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制剩余所有源代码
COPY . .

# 执行构建 (对应 package.json 里的 "build": "tsc -b && vite build")
RUN pnpm build

# --- 第二阶段：部署 (Runner) ---
FROM nginx:alpine

# 从第一阶段复制构建好的 dist 文件夹到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制我们要自定义的 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
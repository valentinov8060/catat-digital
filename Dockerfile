# === STAGE 1: Build ===
FROM node:18-slim AS builder

# Install pnpm secara global
RUN npm install -g pnpm

WORKDIR /app

# Salin berkas package dan lock untuk instalasi dependencies
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Install seluruh dependencies (termasuk devDependencies untuk build TypeScript)
RUN pnpm install --frozen-lockfile

# Salin sisa kode program (folder src, views, public, dll)
COPY . .

# Lakukan kompilasi TypeScript ke JavaScript (menghasilkan folder dist)
RUN pnpm build

# === STAGE 2: Production Run ===
FROM node:18-slim AS runner

RUN npm install -g pnpm

WORKDIR /app

# Hanya salin package.json dan pnpm-lock untuk install production dependencies saja
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Salin folder hasil build dari stage 'builder'
COPY --from=builder /app/dist ./dist

# Salin folder statis pendukung Express (views dan public)
COPY --from=builder /app/views ./views
COPY --from=builder /app/public ./public

# Set environment port default Hugging Face
ENV PORT=7860
EXPOSE 7860

# Jalankan file utama JavaScript hasil build di dalam folder dist
# (Sesuaikan 'index.js' jika file utama Anda di dalam 'src/' bernama lain, misal 'app.js' -> './dist/app.js')
CMD ["node", "./dist/index.js"]
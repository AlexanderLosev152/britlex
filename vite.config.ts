import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import fs from 'fs-extra';
import { glob } from 'glob';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'docs', // изменяем папку сборки на docs
    emptyOutDir: true, // очищаем папку перед сборкой
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // добавьте другие точки входа, если нужно
      },
    },
  },
  plugins: [
    ViteImageOptimizer({
      jpg: { quality: 70 },
      png: { quality: 70 },
      webp: { quality: 50 },
    }),
    {
      name: 'convert-and-cleanup',
      async writeBundle() {
        // Конвертируем в WebP (теперь сохраняем в docs/images)
        const files = await glob('public/images/*.{jpg,png}');
        if (files.length > 0) {
          await imagemin(files, {
            destination: 'docs/images', // изменяем путь на docs/images
            plugins: [imageminWebp({ quality: 50 })],
          });
          console.log(`✅ ${files.length} images converted to WebP`);
        }

        // Удаляем оригинальные JPG/PNG из docs
        const filesToDelete = await glob('docs/images/*.{jpg,png}');
        if (filesToDelete.length > 0) {
          await Promise.all(filesToDelete.map((file) => fs.remove(file)));
          console.log(`🧹 ${filesToDelete.length} original files removed`);
        }
      },
    },
  ],
});

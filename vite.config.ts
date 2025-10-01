import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Enable minification for production
    minify: true,
    
    // Enable source maps for debugging (optional)
    sourcemap: false,
    
    // Configure chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for advanced optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunk for React and React DOM
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          // Utils chunk for calculation utilities
          if (id.includes('/src/utils/')) {
            return 'utils';
          }
        },
        
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/]
    },
    
    // Report compressed size for analysis
    reportCompressedSize: mode === 'analyze'
  },
  
  // Optimize dev server
  server: {
    hmr: {
      overlay: false
    }
  },
  
  // Configure asset handling
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  
  // Enable tree shaking
  define: {
    // Remove console logs in production
    __DEV__: JSON.stringify(mode !== 'production')
  }
}))

// vite.config.js
import { defineConfig } from "file:///sessions/jolly-inspiring-darwin/mnt/outputs/clawbot-mission-control/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/jolly-inspiring-darwin/mnt/outputs/clawbot-mission-control/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/sessions/jolly-inspiring-darwin/mnt/outputs/clawbot-mission-control";
var REPO_NAME = process.env.VITE_REPO_NAME || "clawbot-mission-control";
var vite_config_default = defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? `/${REPO_NAME}/` : "/",
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          charts: ["recharts"],
          motion: ["framer-motion"],
          dnd: ["@hello-pangea/dnd"]
        }
      }
    }
  },
  server: {
    port: 3e3,
    open: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvam9sbHktaW5zcGlyaW5nLWRhcndpbi9tbnQvb3V0cHV0cy9jbGF3Ym90LW1pc3Npb24tY29udHJvbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2pvbGx5LWluc3BpcmluZy1kYXJ3aW4vbW50L291dHB1dHMvY2xhd2JvdC1taXNzaW9uLWNvbnRyb2wvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL2pvbGx5LWluc3BpcmluZy1kYXJ3aW4vbW50L291dHB1dHMvY2xhd2JvdC1taXNzaW9uLWNvbnRyb2wvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuLy8gU2V0IHRoaXMgdG8geW91ciBHaXRIdWIgcmVwb3NpdG9yeSBuYW1lIGZvciBHaXRIdWIgUGFnZXNcbi8vIGUuZy4sIGlmIHlvdXIgcmVwbyBpcyBodHRwczovL2dpdGh1Yi5jb20vdXNlcm5hbWUvY2xhd2JvdC1taXNzaW9uLWNvbnRyb2xcbi8vIHNldCBiYXNlOiAnL2NsYXdib3QtbWlzc2lvbi1jb250cm9sLydcbmNvbnN0IFJFUE9fTkFNRSA9IHByb2Nlc3MuZW52LlZJVEVfUkVQT19OQU1FIHx8ICdjbGF3Ym90LW1pc3Npb24tY29udHJvbCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBiYXNlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gYC8ke1JFUE9fTkFNRX0vYCA6ICcvJyxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgc3VwYWJhc2U6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgY2hhcnRzOiBbJ3JlY2hhcnRzJ10sXG4gICAgICAgICAgbW90aW9uOiBbJ2ZyYW1lci1tb3Rpb24nXSxcbiAgICAgICAgICBkbmQ6IFsnQGhlbGxvLXBhbmdlYS9kbmQnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgICBvcGVuOiB0cnVlLFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFgsU0FBUyxvQkFBb0I7QUFDM1osT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQU96QyxJQUFNLFlBQVksUUFBUSxJQUFJLGtCQUFrQjtBQUVoRCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsTUFBTSxRQUFRLElBQUksYUFBYSxlQUFlLElBQUksU0FBUyxNQUFNO0FBQUEsRUFDakUsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUNqRCxVQUFVLENBQUMsdUJBQXVCO0FBQUEsVUFDbEMsUUFBUSxDQUFDLFVBQVU7QUFBQSxVQUNuQixRQUFRLENBQUMsZUFBZTtBQUFBLFVBQ3hCLEtBQUssQ0FBQyxtQkFBbUI7QUFBQSxRQUMzQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

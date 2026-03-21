import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  define: {
    // some libraries expect a Node-like `global` variable in the browser
    global: "window",
  },
  optimizeDeps: {
    include: ["sockjs-client"],
  },
});

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Vite default port
    env: {
      ADMIN_EMAIL: process.env.CYPRESS_ADMIN_EMAIL ,
      ADMIN_PASSWORD: process.env.CYPRESS_ADMIN_PASSWORD,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

# React + Vite

## Run the chatbot

1. Install dependencies with `npm install`.
2. Create a `.env` file in this folder and add `GEMINI_API_KEY=your_gemini_api_key`.
3. Start the app with `npm run dev`.

The API key is used by the local server and is not included in the browser app. Keep `.env`
private and never commit it. For production, set `GEMINI_API_KEY` in your server environment,
build with `npm run build`, and start the server with `npm start`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

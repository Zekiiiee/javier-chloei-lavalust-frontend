# Just Klowi Things · Product Management

React and Vite frontend for the LavaLust product management API.

## Run locally

```sh
npm install
npm run dev
```

Create `.env.local` in this folder if the API is not at the default `http://localhost/Lavalust` origin:

```env
VITE_API_URL=http://localhost/Lavalust
```

`VITE_API_URL` is the API origin only. Do not add `/api` at the end; the app adds API paths itself.

## Deploy on Render

Create a **Static Site** from this repository with:

- Root directory: `.`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable `VITE_API_URL`: the deployed API origin, such as `https://YOUR-API.onrender.com`

Redeploy after changing the API URL environment variable. The backend must allow requests from the frontend URL through its CORS configuration.

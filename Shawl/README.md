# Shawl Academy

A full-stack React learning platform with a Tailwind CSS frontend, Express API, JWT authentication, and SQLite persistence.

## Local development

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` for the React development client. The API runs on `http://localhost:5000`.

## Production

```powershell
npm run build
npm start
```

The Express server serves the compiled React client from `client-dist` and exposes the API under `/api`.

## API routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|POST /api/tasks` (JWT required)
- `PUT|DELETE /api/tasks/:id` (JWT required)
- `POST /api/messages`
- `POST /api/comments`

## Deployment

The repository includes `Dockerfile`, `render.yaml`, `.github/workflows/ci.yml`, and `.github/workflows/deploy-pages.yml`.

After GitHub Pages is enabled for the repository with **GitHub Actions** as the source, the public website is:

`https://subhamoysinha41-cyber.github.io/Shawl/`

The same React website is also available at `/edu.html` on that Pages site. GitHub Pages hosts the frontend only. Deploy the Docker service to Render (using `render.yaml`) for the Express API and SQLite database, then set the frontend API URL for a hosted backend. The local development proxy continues to use `http://localhost:5000`.

For the Pages forms, authentication, and learning goals to reach the deployed API, add a repository variable named `VITE_API_URL` under **Settings → Secrets and variables → Actions → Variables** with the public Render URL, then rerun the Pages workflow.

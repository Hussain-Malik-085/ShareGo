# ShareGo backend

Express + MongoDB (Mongoose). Serves:

- **Mobile app:** routes under `/api/...` (see `../App-Frontend/config/config.js` → `BASE_URL`)
- **Admin panel:** same data at `/drivers`, `/riders`, `/approve/...`, `/reject/...` (no `/api` prefix)

## Run

```bash
cp .env.example .env
# set MONGODB_URI
npm install
npm start
```

Full Urdu/English steps: [../FYP-SETUP-UR.md](../FYP-SETUP-UR.md)

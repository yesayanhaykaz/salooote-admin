# salooote-admin

## Deploy to production

After pushing to `main`, deploy by running these commands:

```bash
ssh newserver "cd /var/www/salooote-admin && git pull && npm run build && sudo systemctl restart salooote-admin"
```

Or step by step:

```bash
ssh newserver
cd /var/www/salooote-admin
git pull
npm run build
sudo systemctl restart salooote-admin
```

## Local development

```bash
npm run dev      # runs on http://localhost:3001
```

## Environment

- Local API: `http://localhost:8080/api/v1` (`.env.local`)
- Production API: `https://back.salooote.am/api/v1` (`.env.production`)

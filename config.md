```bash

sudo apt update
sudo apt install docker-compose

sudo usermod -aG docker $USER

exec su -l $USER

```

Enter your password and go to the project root

```bash

docker-compose up --build -d

```

Add this to the nginx site config before any other locations
/etc/nginx/sites-available/<your-site>

```
    location /app/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

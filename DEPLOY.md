# Guide de déploiement — Suivi des Interventions

## Mise à jour du serveur existant (pull)

```bash
cd /opt/suivi-Interventions

# Si git pull échoue à cause de __pycache__ ou interventions.db :
git checkout -- __pycache__/
git pull

# Redémarrer le service
sudo systemctl restart suivi-interventions
sudo systemctl status suivi-interventions
```

> Les fichiers `.html`, `.css`, `.js` ne nécessitent pas de redémarrage.
> Redémarrer uniquement quand `main.py` est modifié.

---

## Installation complète sur un nouveau serveur (CentOS / RHEL)

### 1. Prérequis système

```bash
sudo dnf install -y python3 python3-pip git
```

### 2. Cloner le projet

```bash
sudo mkdir -p /opt/suivi-Interventions
sudo chown $USER:$USER /opt/suivi-Interventions

git clone https://github.com/issouf-fofana/suivi-Interventions /opt/suivi-Interventions
cd /opt/suivi-Interventions
```

### 3. Environnement Python

```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

### 4. Créer les dossiers nécessaires

```bash
mkdir -p uploads backups
```

### 5. Service systemd

```bash
sudo nano /etc/systemd/system/suivi-interventions.service
```

Coller :

```ini
[Unit]
Description=Suivi des Interventions - FastAPI
After=network.target

[Service]
User=ifofana
WorkingDirectory=/opt/suivi-Interventions
ExecStart=/opt/suivi-Interventions/env/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable suivi-interventions
sudo systemctl start suivi-interventions
sudo systemctl status suivi-interventions
```

### 6. Firewall

```bash
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### 7. Vérification

```bash
curl http://localhost:8000/
# Ouvrir http://IP_SERVEUR:8000 dans le navigateur
```

---

## Optionnel — Nginx reverse proxy (port 80)

```bash
sudo dnf install -y nginx

sudo nano /etc/nginx/conf.d/suivi.conf
```

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 50M;
    }
}
```

```bash
sudo systemctl enable --now nginx
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

---

## Commande mise à jour en une ligne

```bash
cd /opt/suivi-Interventions && git checkout -- __pycache__/ && git pull && sudo systemctl restart suivi-interventions
```

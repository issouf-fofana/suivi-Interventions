# Suivi des Interventions

Application web (FastAPI + SQLite + frontend HTML/CSS/JS) pour gérer des interventions techniques.

## Fonctionnalités

- Authentification (token + sessions)
- CRUD interventions
- Historique des modifications
- Commentaires + pièces jointes
- Export PDF via impression navigateur (`window.print()`)
- Dashboard, calendrier, administration, statistiques
- Mode sombreshift

## Installation locale

```bash
python -m venv env
source env/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Accéder sur `http://127.0.0.1:8000`.

## Paramètres importants

- DB : `interventions.db`
- Uploads : `uploads/`
- Static : `static/` (HTML/CSS/JS)

## Utilisation

1. Se connecter via la page `/login.html`
2. Créer/modifier/supprimer intervention
3. Cliquer sur `Rapport PDF` pour générer une impression sans sidebar
4. Ajouter des commentaires (fix 422 : `Content-Type: application/json` sur POST)

## GitHub

Ce dépôt : https://github.com/issouf-fofana/suivi-Interventions

## Notes

- API endpoints définis dans `main.py`
- `@media print` dans `static/detail.html` gère l’affichage pour impression
- Correction appliquée : `ajouterCommentaire()` met `Content-Type: application/json`

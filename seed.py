# ============================================================
# seed.py - Import des données CSV dans SQLite
# ============================================================
# Lit le fichier CSV exporté depuis Excel et insère les données
# dans la base de données SQLite.
#
# Usage : python seed.py
# ============================================================

import csv
import sqlite3
import re
from datetime import datetime

DB_PATH = "interventions.db"
CSV_PATH = "Suivi des interventions 2024.csv"

# Normalisation des mois (gère les variantes de casse et d'accentuation)
MOIS_MAP = {
    "janvier": "janvier", "janv": "janvier",
    "fevrier": "février", "février": "février", "fev": "février",
    "mars": "mars",
    "avril": "avril", "avr": "avril",
    "mai": "mai",
    "juin": "juin",
    "juillet": "juillet", "juil": "juillet",
    "aout": "août", "août": "août",
    "septembre": "septembre", "sept": "septembre",
    "octobre": "octobre", "oct": "octobre",
    "novembre": "novembre", "nov": "novembre",
    "decembre": "décembre", "décembre": "décembre", "dec": "décembre",
}

# Normalisation des prestataires
PRESTATAIRES_MAP = {
    "dsi": "DSI",
    "cogitech": "COGITECH",
    "manage engine": "Manage Engine",
    "manageengine": "Manage Engine",
    "cbi": "CBI",
    "gbss": "GBSS",
    "awale": "AWALE",
    "prosuma": "PROSUMA",
    "orange": "ORANGE",
    "mtn": "MTN",
    "aric": "ARIC",
}


def normalise_mois(mois_raw):
    """Normalise le nom du mois."""
    if not mois_raw:
        return None
    key = mois_raw.strip().lower()
    # Supprimer les accents pour la comparaison
    key_simple = key.replace("é", "e").replace("è", "e").replace("û", "u").replace("ô", "o")
    return MOIS_MAP.get(key_simple, MOIS_MAP.get(key, mois_raw.strip().lower()))


def normalise_prestataire(prest_raw):
    """Normalise le nom du prestataire."""
    if not prest_raw:
        return None
    key = prest_raw.strip().lower()
    return PRESTATAIRES_MAP.get(key, prest_raw.strip())


def normalise_type(type_raw):
    """Normalise le type d'intervention."""
    if not type_raw:
        return "Planifiée"
    t = type_raw.strip().lower()
    if t in ["planifiée", "planifiee", "planifie"]:
        return "Planifiée"
    elif t in ["dépannage", "depannage", "depann"]:
        return "Dépannage"
    return type_raw.strip().capitalize()


def parse_date(date_raw):
    """Convertit une date DD/MM/YYYY en format ISO YYYY-MM-DD."""
    if not date_raw:
        return None
    date_str = date_raw.strip()
    # Supprimer les espaces internes
    date_str = re.sub(r'\s+', '', date_str)
    # Corriger les années à 5 chiffres (ex: 02024 → 2024)
    date_str = re.sub(r'/(\d{5})$', lambda m: '/' + m.group(1)[1:], date_str)
    try:
        return datetime.strptime(date_str, "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def parse_heure(heure_raw):
    """Nettoie et valide une heure HH:MM."""
    if not heure_raw:
        return None
    h = heure_raw.strip()
    if re.match(r'^\d{2}:\d{2}$', h):
        return h
    return None


def calcul_duree(date_debut, heure_debut, date_fin, heure_fin):
    """Calcule la durée en minutes entre deux datetime."""
    try:
        if date_debut and heure_debut and date_fin and heure_fin:
            dt1 = datetime.strptime(f"{date_debut} {heure_debut}", "%Y-%m-%d %H:%M")
            dt2 = datetime.strptime(f"{date_fin} {heure_fin}", "%Y-%m-%d %H:%M")
            delta = dt2 - dt1
            minutes = int(delta.total_seconds() / 60)
            return minutes if minutes >= 0 else None
    except Exception:
        pass
    return None


def parse_duree_hhmm(duree_raw):
    """Parse une durée au format HH:MM en minutes."""
    if not duree_raw:
        return None
    d = duree_raw.strip()
    # Ignorer les valeurs corrompues (####...)
    if '#' in d:
        return None
    match = re.match(r'^(\d+):(\d{2})$', d)
    if match:
        heures = int(match.group(1))
        minutes = int(match.group(2))
        return heures * 60 + minutes
    return None


def init_db():
    """Crée la table si elle n'existe pas."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS interventions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prestataire TEXT NOT NULL,
            type_intervention TEXT NOT NULL,
            mois TEXT,
            annee INTEGER,
            date_debut TEXT,
            heure_debut TEXT,
            date_fin TEXT,
            heure_fin TEXT,
            duree_minutes INTEGER,
            site TEXT,
            travaux TEXT,
            prochaine_intervention TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def seed():
    """Importe les données depuis le CSV dans SQLite."""
    init_db()

    conn = sqlite3.connect(DB_PATH)

    # Vider la table avant import (évite les doublons)
    conn.execute("DELETE FROM interventions")
    conn.commit()

    importees = 0
    erreurs = 0
    lignes_vides = 0

    # Lecture du CSV (séparateur ;, encodage utf-8 avec BOM éventuel)
    encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
    lignes = None

    for enc in encodings:
        try:
            with open(CSV_PATH, "r", encoding=enc) as f:
                reader = csv.reader(f, delimiter=";")
                lignes = list(reader)
            break
        except Exception:
            continue

    if lignes is None:
        print("ERREUR : Impossible de lire le fichier CSV.")
        return

    # La ligne 1 est le titre "SUIVI DES INTERVENTIONS"
    # La ligne 2 est l'en-tête des colonnes
    # Les données commencent à la ligne 3 (index 2)
    for i, row in enumerate(lignes):
        # Ignorer la ligne de titre et d'en-tête
        if i < 2:
            continue

        # Vérifier que la ligne a assez de colonnes
        if len(row) < 2:
            lignes_vides += 1
            continue

        # Extraire les colonnes
        num = row[0].strip() if len(row) > 0 else ""
        prestataire_raw = row[1].strip() if len(row) > 1 else ""
        type_raw = row[2].strip() if len(row) > 2 else ""
        mois_raw = row[3].strip() if len(row) > 3 else ""
        annee_raw = row[4].strip() if len(row) > 4 else ""
        date_debut_raw = row[5].strip() if len(row) > 5 else ""
        heure_debut_raw = row[6].strip() if len(row) > 6 else ""
        date_fin_raw = row[7].strip() if len(row) > 7 else ""
        heure_fin_raw = row[8].strip() if len(row) > 8 else ""
        duree_raw = row[9].strip() if len(row) > 9 else ""
        site_raw = row[10].strip() if len(row) > 10 else ""
        travaux_raw = row[11].strip() if len(row) > 11 else ""
        prochaine_raw = row[12].strip() if len(row) > 12 else ""

        # Ignorer les lignes vides (sans prestataire ET sans numéro valide)
        if not prestataire_raw and not num:
            lignes_vides += 1
            continue

        # Ignorer si pas de prestataire
        if not prestataire_raw:
            lignes_vides += 1
            continue

        try:
            # Nettoyage des données
            prestataire = normalise_prestataire(prestataire_raw)
            type_intervention = normalise_type(type_raw)
            mois = normalise_mois(mois_raw)
            annee = int(annee_raw) if annee_raw.isdigit() else None

            date_debut = parse_date(date_debut_raw)
            heure_debut = parse_heure(heure_debut_raw)
            date_fin = parse_date(date_fin_raw)
            heure_fin = parse_heure(heure_fin_raw)

            # Calcul durée : priorité au calcul réel, sinon parsing de la colonne
            duree_minutes = calcul_duree(date_debut, heure_debut, date_fin, heure_fin)
            if duree_minutes is None:
                duree_minutes = parse_duree_hhmm(duree_raw)

            site = site_raw if site_raw else None
            travaux = travaux_raw if travaux_raw else None
            prochaine = parse_date(prochaine_raw) if prochaine_raw else None

            # Déduire mois/année depuis date_debut si absent
            if date_debut and not mois:
                try:
                    d = datetime.strptime(date_debut, "%Y-%m-%d")
                    mois_noms = ["janvier","février","mars","avril","mai","juin",
                                 "juillet","août","septembre","octobre","novembre","décembre"]
                    mois = mois_noms[d.month - 1]
                    if not annee:
                        annee = d.year
                except Exception:
                    pass

            conn.execute("""
                INSERT INTO interventions
                (prestataire, type_intervention, mois, annee, date_debut, heure_debut,
                 date_fin, heure_fin, duree_minutes, site, travaux, prochaine_intervention)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """, (prestataire, type_intervention, mois, annee,
                  date_debut, heure_debut, date_fin, heure_fin,
                  duree_minutes, site, travaux, prochaine))

            importees += 1

        except Exception as e:
            print(f"  ⚠ Erreur ligne {i+1} (N°{num}): {e}")
            erreurs += 1

    conn.commit()
    conn.close()

    print(f"\n{'='*50}")
    print(f"  Import terminé !")
    print(f"  ✅ {importees} lignes importées avec succès")
    print(f"  ⚠  {erreurs} erreurs")
    print(f"  ⏭  {lignes_vides} lignes vides ignorées")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    print("Démarrage de l'import des données...")
    seed()

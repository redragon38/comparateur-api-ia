#!/usr/bin/env python3
"""
Téléchargement des logos pour le comparateur API IA.

Usage :
    python download_logos.py                        # télécharge tout
    python download_logos.py --output ./public/logos
    python download_logos.py --only-missing         # saute les logos déjà présents
    python download_logos.py --dry-run              # affiche sans télécharger

Stratégie par ordre de priorité :
  1. URL logo explicite dans tools.json (champ logoUrl si présent)
  2. Google Favicon HD  (https://www.google.com/s2/favicons?sz=128&domain=…)
  3. DuckDuckGo Favicon (https://icons.duckduckgo.com/ip3/…)
  4. Clearbit Logo     (https://logo.clearbit.com/…)
  5. Favicon direct    (https://<domain>/favicon.ico)

Les fichiers sont enregistrés en PNG dans le dossier de sortie.
Les SVG déjà présents ne sont PAS écrasés sauf avec --force.
"""

import argparse
import json
import os
import sys
import time
import urllib.parse
from pathlib import Path
from typing import Optional
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# ─── Configuration ────────────────────────────────────────────────────────────

DATA_FILE   = Path(__file__).parent / "data" / "tools.json"
OUTPUT_DIR  = Path(__file__).parent / "public" / "logos"
USER_AGENT  = "Mozilla/5.0 (compatible; LogoDownloader/1.0)"
TIMEOUT     = 10        # secondes par requête
DELAY       = 0.25      # délai entre requêtes (poli avec les serveurs)
MIN_BYTES   = 200       # fichier plus petit = probablement une erreur

# Domaines connus → logo à utiliser (évite les faux-positifs favicon)
DOMAIN_OVERRIDES = {
    "huggingface.co":        "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
    "replicate.com":         "https://replicate.com/favicon.ico",
    "openrouter.ai":         "https://openrouter.ai/favicon.ico",
    "docs.together.ai":      "https://www.together.ai/favicon.ico",
    "together.ai":           "https://www.together.ai/favicon.ico",
    "docs.fireworks.ai":     "https://fireworks.ai/favicon.ico",
    "fireworks.ai":          "https://fireworks.ai/favicon.ico",
    "docs.aws.amazon.com":   "https://aws.amazon.com/favicon.ico",
    "ai.google.dev":         "https://www.gstatic.com/devrel-devsite/prod/v0/dl/img/google-developers-logo.svg",
    "learn.microsoft.com":   "https://learn.microsoft.com/favicon.ico",
    "deepinfra.com":         "https://deepinfra.com/favicon.ico",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def fetch(url: str, timeout: int = TIMEOUT) -> Optional[bytes]:
    """Télécharge une URL et retourne les bytes, ou None en cas d'échec."""
    try:
        req = Request(url, headers={"User-Agent": USER_AGENT})
        with urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                data = resp.read()
                if len(data) >= MIN_BYTES:
                    return data
    except (URLError, HTTPError, Exception):
        pass
    return None


def guess_extension(data: bytes, url: str) -> str:
    """Devine l'extension à partir des magic bytes ou de l'URL."""
    if data[:4] == b'\x89PNG':
        return ".png"
    if data[:3] == b'GIF':
        return ".gif"
    if data[:2] in (b'\xff\xd8', b'\xff\xe0', b'\xff\xe1'):
        return ".jpg"
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return ".webp"
    if b'<svg' in data[:512] or b'<?xml' in data[:512]:
        return ".svg"
    if data[:2] == b'\x00\x00' and b'ftyp' in data[:16]:
        return ".ico"
    # Fallback sur l'URL
    path = urllib.parse.urlparse(url).path
    for ext in (".png", ".svg", ".ico", ".jpg", ".jpeg", ".gif", ".webp"):
        if path.lower().endswith(ext):
            return ext
    return ".png"


def domain_from_url(url: str) -> Optional[str]:
    """Extrait le domaine sans www."""
    try:
        parsed = urllib.parse.urlparse(url)
        host = parsed.netloc or parsed.path
        return host.lstrip("www.")
    except Exception:
        return None


def logo_candidates(domain: str) -> list[str]:
    """Retourne les URLs candidates pour un domaine, par ordre de priorité."""
    if domain in DOMAIN_OVERRIDES:
        return [DOMAIN_OVERRIDES[domain]]

    return [
        # Google Favicon HD (128×128)
        f"https://www.google.com/s2/favicons?sz=128&domain={domain}",
        # DuckDuckGo
        f"https://icons.duckduckgo.com/ip3/{domain}.ico",
        # Clearbit Logo API
        f"https://logo.clearbit.com/{domain}",
        # Favicon direct
        f"https://{domain}/favicon.ico",
        f"https://www.{domain}/favicon.ico",
    ]


def download_logo(slug: str, website: str, output_dir: Path,
                  force: bool = False, dry_run: bool = False) -> bool:
    """
    Télécharge le logo pour un slug donné.
    Retourne True si le fichier a été écrit (ou le serait en dry-run).
    """
    domain = domain_from_url(website)
    if not domain:
        return False

    # Vérifie si un logo existe déjà
    if not force:
        for ext in (".png", ".svg", ".jpg", ".jpeg", ".ico", ".webp", ".gif"):
            existing = output_dir / f"{slug}{ext}"
            if existing.exists() and existing.stat().st_size >= MIN_BYTES:
                return False   # déjà là, on saute

    candidates = logo_candidates(domain)

    for url in candidates:
        if dry_run:
            print(f"  [dry-run] {slug} ← {url}")
            return True

        data = fetch(url)
        if data:
            ext = guess_extension(data, url)
            dest = output_dir / f"{slug}{ext}"
            dest.write_bytes(data)
            return True
        time.sleep(DELAY)

    return False


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    global DELAY
    parser = argparse.ArgumentParser(description="Telecharge les logos des API IA.")
    parser.add_argument("--data",         default=str(DATA_FILE),   help="Chemin vers tools.json")
    parser.add_argument("--output", "-o", default=str(OUTPUT_DIR),  help="Dossier de sortie")
    parser.add_argument("--only-missing", action="store_true",       help="Saute les logos deja presents")
    parser.add_argument("--force",        action="store_true",       help="Reecrit meme si le logo existe")
    parser.add_argument("--dry-run",      action="store_true",       help="Affiche sans telecharger")
    parser.add_argument("--delay",        type=float, default=0.25,  help="Delai entre requetes (defaut : 0.25s)")
    parser.add_argument("--limit",        type=int,   default=0,     help="Limite le nombre de telechargements (debug)")
    args = parser.parse_args()

    data_path   = Path(args.data)
    output_dir  = Path(args.output)
    DELAY = args.delay

    if not data_path.exists():
        print(f"❌  Fichier introuvable : {data_path}", file=sys.stderr)
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    with open(data_path, encoding="utf-8") as f:
        tools = json.load(f)

    print(f"📦  {len(tools)} outils chargés depuis {data_path}")
    print(f"📁  Dossier de sortie : {output_dir}\n")

    # Déduplique par domaine pour ne télécharger qu'une fois par fournisseur
    seen_domains: dict = {}   # domain → slug du premier outil
    tasks: list = []   # (slug_fichier, website)

    for tool in tools:
        slug    = tool.get("slug", "")
        website = tool.get("website") or tool.get("docsUrl") or ""
        logo    = tool.get("logo", "")

        if not slug or not website:
            continue

        domain = domain_from_url(website)
        if not domain:
            continue

        # Nom de fichier = slug du premier outil rencontré pour ce domaine,
        # OU slug propre de l'outil si son logo lui est déjà dédié
        dedicated_logo = logo and logo != "/logos/default.svg"

        if dedicated_logo:
            # Le logo est déjà nommé d'après le slug dans /public/logos/
            file_slug = Path(logo).stem   # ex. "openai-api"
        elif domain in seen_domains:
            # On a déjà planifié ce domaine → on copie/symlink plus tard
            tasks.append((slug, website))
            continue
        else:
            seen_domains[domain] = slug
            file_slug = slug

        tasks.append((file_slug, website))

    # Déduplique les file_slug (on ne télécharge chaque slug qu'une fois)
    unique_tasks: dict = {}
    for file_slug, website in tasks:
        unique_tasks.setdefault(file_slug, website)

    total      = len(unique_tasks)
    downloaded = 0
    skipped    = 0
    failed     = 0

    print(f"🔍  {total} logos uniques à traiter\n")

    for i, (file_slug, website) in enumerate(unique_tasks.items(), 1):
        if args.limit and downloaded >= args.limit:
            print(f"\n⚠️  Limite de {args.limit} téléchargements atteinte.")
            break

        prefix = f"[{i:4d}/{total}]"

        # Saute si déjà présent (mode --only-missing)
        if args.only_missing and not args.force:
            exists = any(
                (output_dir / f"{file_slug}{ext}").exists()
                for ext in (".png", ".svg", ".jpg", ".jpeg", ".ico", ".webp", ".gif")
            )
            if exists:
                skipped += 1
                print(f"{prefix} ⏭  {file_slug}  (déjà présent)")
                continue

        ok = download_logo(
            slug       = file_slug,
            website    = website,
            output_dir = output_dir,
            force      = args.force,
            dry_run    = args.dry_run,
        )

        if ok:
            downloaded += 1
            status = "🖼 " if not args.dry_run else "📋"
            print(f"{prefix} {status} {file_slug}")
        else:
            failed += 1
            print(f"{prefix} ❌  {file_slug}  (échec ou déjà présent)")

        if not args.dry_run and i % 50 == 0:
            time.sleep(1)   # pause plus longue toutes les 50 requêtes

    print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Téléchargés : {downloaded}
⏭  Ignorés     : {skipped}
❌  Échecs      : {failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Logos enregistrés dans : {output_dir}
""")


if __name__ == "__main__":
    main()

import os
import sys
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json # For pretty printing actions

# Cargar variables de entorno desde E:\Dev\tcd1\.env
dotenv_path = os.path.join('E:', os.sep, 'Dev', 'tcd1', '.env')
load_dotenv(dotenv_path=dotenv_path)

def resumen_meta():
    sys.stdout.reconfigure(encoding='utf-8')
    print("--- Resumen de Meta Ads ---")
    access_token = os.getenv("FACEBOOK_ACCESS_TOKEN")
    if not access_token:
        print("Error: FACEBOOK_ACCESS_TOKEN no encontrado en E:\\Dev\\tcd1\\.env")
        return

    ad_account_id = "act_858332333990895"
    graph_api_version = "v21.0"
    base_url = f"https://graph.facebook.com/{graph_api_version}/{ad_account_id}"

    today = datetime.now()

    def get_insights(date_preset, level="ad"):
        print(f"\n--- Insights de {level.capitalize()} ({date_preset.replace('_', ' ').title()}) ---")
        insights_params = {
            "access_token": access_token,
            "level": level,
            "date_preset": date_preset,
            "fields": "campaign_name,ad_name,spend,impressions,reach,inline_link_clicks,ctr,cpc,actions,conversions",
            "limit": 100 # Max 100 for default GHL API
        }
        response = requests.get(f"{base_url}/insights", params=insights_params)
        if response.status_code != 200:
            print(f"Error al obtener insights para {date_preset}: {response.status_code} - {response.text}")
            return []
        return response.json().get("data", [])

    # Get insights for last 30 days
    insights_30d = get_insights("last_30d", level="campaign")
    if insights_30d:
        for insight in insights_30d:
            campaign_name = insight.get('campaign_name')
            spend = float(insight.get('spend', 0))
            impressions = int(insight.get('impressions', 0))
            reach = int(insight.get('reach', 0))
            link_clicks = int(insight.get('inline_link_clicks', 0))
            ctr = float(insight.get('ctr', 0))
            cpc = float(insight.get('cpc', 0))

            frequency = impressions / reach if reach > 0 else 0
            cpm = (spend / impressions * 1000) if impressions > 0 else 0

            print(f"\nCampaña: {campaign_name}")
            print(f"  Gasto (USD): {spend:.2f}")
            print(f"  Impresiones: {impressions}")
            print(f"  Alcance: {reach}")
            print(f"  Frecuencia: {frequency:.2f}")
            print(f"  Clics en Enlace: {link_clicks}")
            print(f"  CTR: {ctr:.2f}%")
            print(f"  CPC: {cpc:.2f}")
            print(f"  CPM: {cpm:.2f}")

            actions = insight.get('actions', [])
            conversions = insight.get('conversions', [])

            if actions:
                print("  Acciones (tipo: valor):")
                for action in actions:
                    print(f"    - {action.get('action_type')}: {action.get('value')}")
            if conversions:
                print("  Conversiones (tipo: valor):")
                for conv in conversions:
                    print(f"    - {conv.get('action_type')}: {conv.get('value')}")
            if not actions and not conversions:
                print("  No se reportaron acciones o conversiones.")

    # Get insights for last 14 days (ad level)
    insights_14d = get_insights("last_14d", level="ad")
    if insights_14d:
        for insight in insights_14d:
            campaign_name = insight.get('campaign_name')
            ad_name = insight.get('ad_name')
            spend = float(insight.get('spend', 0))
            impressions = int(insight.get('impressions', 0))
            reach = int(insight.get('reach', 0))
            link_clicks = int(insight.get('inline_link_clicks', 0))
            ctr = float(insight.get('ctr', 0))
            cpc = float(insight.get('cpc', 0))

            frequency = impressions / reach if reach > 0 else 0
            cpm = (spend / impressions * 1000) if impressions > 0 else 0

            print(f"\n  Anuncio: {ad_name} (Campaña: {campaign_name})")
            print(f"    Gasto (USD): {spend:.2f}")
            print(f"    Impresiones: {impressions}")
            print(f"    Alcance: {reach}")
            print(f"    Frecuencia: {frequency:.2f}")
            print(f"    Clics en Enlace: {link_clicks}")
            print(f"    CTR: {ctr:.2f}%")
            print(f"    CPC: {cpc:.2f}")
            print(f"    CPM: {cpm:.2f}")

            actions = insight.get('actions', [])
            conversions = insight.get('conversions', [])

            if actions:
                print("    Acciones (tipo: valor):")
                for action in actions:
                    print(f"      - {action.get('action_type')}: {action.get('value')}")
            if conversions:
                print("    Conversiones (tipo: valor):")
                for conv in conversions:
                    print(f"      - {conv.get('action_type')}: {conv.get('value')}")
            if not actions and not conversions:
                print("    No se reportaron acciones o conversiones.")

if __name__ == "__main__":
    resumen_meta()

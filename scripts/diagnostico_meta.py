
import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

# El `.env` del proyecto, encontrado desde este archivo. Antes esta línea era
# `os.path.join('E:', os.sep, 'Dev', 'tcd1', '.env')`: esa ruta existe en una
# sola computadora, y en cualquier otra el script no encontraba la clave y
# decía que faltaba en el `.env` — cuando el `.env` estaba ahí.
RAIZ_DEL_PROYECTO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(RAIZ_DEL_PROYECTO, '.env')
load_dotenv(dotenv_path=dotenv_path)

def diagnostico_meta():
    print("--- Diagnóstico Meta ---")
    access_token = os.getenv("FACEBOOK_ACCESS_TOKEN")
    if not access_token:
        print(f"Error: FACEBOOK_ACCESS_TOKEN no encontrado en {dotenv_path}")
        return

    ad_account_id = "act_858332333990895"
    graph_api_version = "v21.0"
    base_url = f"https://graph.facebook.com/{graph_api_version}/{ad_account_id}"

    today = datetime.now()
    since_date = (today - timedelta(days=14)).strftime("%Y-%m-%d")
    until_date = today.strftime("%Y-%m-%d")

    try:
        # Consultar Insights
        print("\n--- Insights de Anuncios (Últimos 14 días) ---")
        insights_params = {
            "access_token": access_token,
            "level": "ad",
            "date_preset": "last_14d",
            "fields": "ad_name,spend,impressions,inline_link_clicks,ctr,cpc,actions",
            "limit": 100
        }
        insights_response = requests.get(f"{base_url}/insights", params=insights_params)
        if insights_response.status_code != 200:
            print(f"Error al obtener insights: {insights_response.status_code} - {insights_response.text}")
        else:
            insights_data = insights_response.json()
            if insights_data and insights_data.get("data"):
                for insight in insights_data["data"]:
                    print(f"\nAd: {insight.get('ad_name')}")
                    print(f"Gasto (USD): {float(insight.get('spend', 0)):.2f}")
                    print(f"Impresiones: {insight.get('impressions')}")
                    print(f"Clics en Enlace: {insight.get('inline_link_clicks', 0)}")
                    print(f"CTR: {float(insight.get('ctr', 0)):.2f}%")
                    print(f"CPC: {float(insight.get('cpc', 0)):.2f}")
                    # Manejar 'actions' si contiene 'schedule_website'
                    if 'actions' in insight:
                        for action in insight['actions']:
                            if action.get('action_type') == 'schedule_website':
                                print(f"Resultados (schedule_website): {action.get('value')}")
            else:
                print("No se encontraron insights de anuncios.")

        # Consultar Campañas
        print("\n--- Campañas (ID, Nombre, Estado) ---")
        campaigns_params = {
            "access_token": access_token,
            "fields": "id,name,status,effective_status",
            "limit": 100
        }
        campaigns_response = requests.get(f"{base_url}/campaigns", params=campaigns_params)
        if campaigns_response.status_code != 200:
            print(f"Error al obtener campañas: {campaigns_response.status_code} - {campaigns_response.text}")
        else:
            campaigns_data = campaigns_response.json()
            if campaigns_data and campaigns_data.get("data"):
                for campaign in campaigns_data["data"]:
                    print(f"\nID: {campaign.get('id')}")
                    print(f"Nombre: {campaign.get('name')}")
                    print(f"Estado: {campaign.get('status')} ({campaign.get('effective_status')})")
            else:
                print("No se encontraron campañas.")

    except requests.exceptions.RequestException as e:
        print(f"Error de conexión con la API de Meta: {e}")
    except Exception as e:
        print(f"Ocurrió un error inesperado en Meta diagnóstico: {e}")

if __name__ == "__main__":
    diagnostico_meta()

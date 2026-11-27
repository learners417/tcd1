import os
import sys
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

def diagnostico_ghl():
    sys.stdout.reconfigure(encoding='utf-8')
    print("\n--- Diagnóstico GoHighLevel ---")
    api_key = os.getenv("GOHIGHLEVEL_API_KEY")
    if not api_key:
        print(f"Error: GOHIGHLEVEL_API_KEY no encontrado en {dotenv_path}")
        return

    base_url = "https://services.leadconnectorhq.com/"
    location_id = "SImzaMApYvtVV8UzvlgD"
    api_version = "2021-07-28"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Version": api_version,
        "Accept": "application/json"
    }

    try:
        # Obtener Pipelines
        print("\n--- Pipelines ---")
        pipelines_response = requests.get(f"{base_url}opportunities/pipelines?locationId={location_id}", headers=headers)
        if pipelines_response.status_code != 200:
            print(f"Error al obtener pipelines: {pipelines_response.status_code} - {pipelines_response.text}")
            return
        pipelines_response.raise_for_status()
        pipelines_data = pipelines_response.json()
        pipeline_names_to_id = {}
        pipeline_id_to_stages = {}

        if pipelines_data and pipelines_data.get("pipelines"):
            for pipeline in pipelines_data["pipelines"]:
                print(f"  - {pipeline.get('name')} (ID: {pipeline.get('id')})")
                pipeline_names_to_id[pipeline.get('name')] = pipeline.get('id')

                stage_map = {}
                for stage in pipeline.get('stages', []):
                    stage_map[stage.get('id')] = stage.get('name')
                pipeline_id_to_stages[pipeline.get('id')] = stage_map
        else:
            print("No se encontraron pipelines.")
            return

        print("\n--- Conteo de Oportunidades por Pipeline y Etapa ---")
        target_pipelines = ["Meta · Instalación", "VSL DIRECTO", "INSTAGRAM", "Clientes Reto Semilla"]

        for p_name in target_pipelines:
            p_id = pipeline_names_to_id.get(p_name)
            if not p_id:
                print(f"  Pipeline '{p_name}' no encontrado. Saltando.")
                continue

            print(f"\n  Pipeline: {p_name} (ID: {p_id})")
            opportunities_count_by_stage = {}

            all_opportunities_payload = {
                "locationId": location_id,
                "limit": 100 # Adjust limit as needed, max 100 for default GHL API
            }
            all_opportunities_response = requests.post(f"{base_url}opportunities/search", headers=headers, json=all_opportunities_payload)
            if all_opportunities_response.status_code != 200:
                print(f"    Error al obtener todas las oportunidades: {all_opportunities_response.status_code} - {all_opportunities_response.text}")
                continue
            all_opportunities_response.raise_for_status()
            all_opportunities_data = all_opportunities_response.json()
            _ = None # Prevents implicit printing of the last evaluated expression

            # Filter opportunities by current pipelineId in Python
            opportunities_data = {"opportunities": []}
            if all_opportunities_data and all_opportunities_data.get("opportunities"):
                opportunities_data["opportunities"] = [
                    opp for opp in all_opportunities_data["opportunities"]
                    if opp.get('pipelineId') == p_id
                ]

            # Initialize counts for all stages in correct order
            current_pipeline_info = next((p for p in pipelines_data.get("pipelines", []) if p.get("id") == p_id), None)
            pipeline_stages_ordered = []
            if current_pipeline_info and current_pipeline_info.get("stages"):
                pipeline_stages_ordered = sorted(
                    [(stage.get("id"), stage.get("name")) for stage in current_pipeline_info.get("stages", [])],
                    key=lambda item: next((s.get("order", 999) for s in current_pipeline_info.get("stages", []) if s.get("id") == item[0]), 999)
                )
            opportunities_count_by_stage = {stage_name: 0 for stage_id, stage_name in pipeline_stages_ordered}

            latest_opportunities = []

            if opportunities_data and opportunities_data.get("opportunities"):
                for opp in opportunities_data["opportunities"]:
                    stage_id = opp.get('pipelineStageId')
                    stage_name = pipeline_id_to_stages.get(p_id, {}).get(stage_id, f"Stage ID: {stage_id}")
                    opportunities_count_by_stage[stage_name] = opportunities_count_by_stage.get(stage_name, 0) + 1

                    latest_opportunities.append(opp)

                # Sort latest_opportunities by dateAdded in descending order to get the most recent
                latest_opportunities.sort(key=lambda x: x.get('dateAdded', ''), reverse=True)

                if opportunities_count_by_stage:
                    for stage_id, stage_name in pipeline_stages_ordered: # Iterate through sorted stages
                        print(f"    - {stage_name}: {opportunities_count_by_stage.get(stage_name, 0)} oportunidades")
                else:
                    print(f"    No se encontraron oportunidades en el pipeline '{p_name}'.")
            else:
                print(f"    No se encontraron oportunidades en el pipeline '{p_name}'.")

            # Display details of the last 15 opportunities for specific pipelines
            if p_name in ["Meta · Instalación", "VSL DIRECTO"] and latest_opportunities:
                print(f"\n    --- Últimas 15 Oportunidades en {p_name} ---")
                for opp in latest_opportunities[:15]:
                    contact_info = opp.get('contact', {})
                    attributions = opp.get('attributions', {})
                    utm_source = attributions.get('utmSource')
                    utm_campaign = attributions.get('utmCampaign')
                    utm_content = attributions.get('utmContent')

                    print(f"      Nombre: {contact_info.get('firstName', '')} {contact_info.get('lastName', '')}")
                    print(f"      Email: {contact_info.get('email', 'N/A')}")
                    print(f"      Teléfono: {contact_info.get('phone', 'N/A')}")
                    current_stage_name = pipeline_id_to_stages.get(p_id, {}).get(opp.get('pipelineStageId'), f"Stage ID: {opp.get('pipelineStageId')}")
                    print(f"      Etapa Actual: {current_stage_name}")
                    print(f"      Fecha de Creación: {opp.get('dateAdded', 'N/A')}")
                    print(f"      Atribución (UTMs): Source='{utm_source}', Campaign='{utm_campaign}', Content='{utm_content}'" if utm_source else "      Atribución (UTMs): N/A")

                    tags_list = []
                    for tag in contact_info.get('tags', []): # Assuming tags are under contact_info
                        if isinstance(tag, dict) and 'name' in tag:
                            tags_list.append(tag['name'])
                        elif isinstance(tag, str):
                            tags_list.append(tag)
                    print(f"      Tags: {', '.join(tags_list) if tags_list else 'Ninguno'}")
                    print("-" * 30)

        # Obtener los Últimos 10 Contactos Creados
        print("\n--- Últimos 10 Contactos Creados ---")
        contacts_params = {
            "locationId": location_id,
            "limit": 10,
        }
        contacts_response = requests.get(f"{base_url}contacts", headers=headers, params=contacts_params)
        if contacts_response.status_code != 200:
            print(f"Error al obtener contactos: {contacts_response.status_code} - {contacts_response.text}")
            return
        contacts_response.raise_for_status()
        contacts_data = contacts_response.json()

        if contacts_data and contacts_data.get("contacts"):
            for contact in contacts_data["contacts"]:
                print(f"\n  Nombre: {contact.get('firstName')} {contact.get('lastName')}")
                print(f"  Email: {contact.get('email', 'N/A')}")
                print(f"  Teléfono: {contact.get('phone', 'N/A')}")
                print(f"  Fecha de Creación: {contact.get('dateAdded', 'N/A')}")
                tags_list = []
                for tag in contact.get('tags', []):
                    if isinstance(tag, dict) and 'name' in tag:
                        tags_list.append(tag['name'])
                    elif isinstance(tag, str):
                        tags_list.append(tag)
                print(f"  Tags: {', '.join(tags_list) if tags_list else 'Ninguno'}")
        else:
            print("No se encontraron contactos recientes.")

    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API de GoHighLevel: {e}")
    except Exception as e:
        print(f"Ocurrió un error inesperado en GoHighLevel diagnóstico: {e}")

if __name__ == "__main__":
    diagnostico_ghl()

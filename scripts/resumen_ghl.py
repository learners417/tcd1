import os
import sys
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
import re

# Cargar variables de entorno desde E:\Dev\tcd1\.env
dotenv_path = os.path.join('E:', os.sep, 'Dev', 'tcd1', '.env')
load_dotenv(dotenv_path=dotenv_path)

def generar_resumen_ghl():
    sys.stdout.reconfigure(encoding='utf-8')
    print("--- Resumen de Oportunidades GoHighLevel ---")

    api_key = os.getenv("GOHIGHLEVEL_API_KEY")
    if not api_key:
        print("Error: GOHIGHLEVEL_API_KEY no encontrado en E:\\Dev\\tcd1\\.env")
        return

    base_url = "https://services.leadconnectorhq.com/"
    location_id = "SImzaMApYvtVV8UzvlgD"
    api_version = "2021-07-28"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Version": api_version,
        "Accept": "application/json"
    }

    pipelines_data = None
    try:
        pipelines_response = requests.get(f"{base_url}opportunities/pipelines?locationId={location_id}", headers=headers)
        pipelines_response.raise_for_status()
        pipelines_data = pipelines_response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener pipelines de la API: {e}")
        return

    if not pipelines_data or not pipelines_data.get("pipelines"):
        print("No se pudieron obtener los datos de los pipelines de la API.")
        return

    pipeline_names_to_id = {}
    pipeline_id_to_stages = {}
    pipeline_id_to_stages_ordered = {}

    for pipeline in pipelines_data["pipelines"]:
        p_id = pipeline.get('id')
        p_name = pipeline.get('name')
        if p_id and p_name:
            pipeline_names_to_id[p_name] = p_id
            stage_map = {stage.get('id'): stage.get('name') for stage in pipeline.get('stages', [])}
            pipeline_id_to_stages[p_id] = stage_map
            # Order stages by 'order' property
            pipeline_id_to_stages_ordered[p_id] = sorted(
                [(stage.get('id'), stage.get('name')) for stage in pipeline.get('stages', [])],
                key=lambda item: next((s.get('order', 999) for s in pipeline.get('stages', []) if s.get('id') == item[0]), 999)
            )

    # Leer el archivo de oportunidades y extraer múltiples objetos JSON
    all_opportunities = []
    opportunities_by_id = {} # For deduplication
    try:
        file_path = "C:\\Users\\javik\\.claude\\projects\\e--Dev-landings\\9c8babe6-38da-4a79-9b7d-da1728695f5d\\tool-results\\ba8xfr37e.txt"
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        decoder = json.JSONDecoder()
        idx = 0
        while idx < len(content):
            try:
                obj, new_idx = decoder.raw_decode(content[idx:])
                if isinstance(obj, dict) and "opportunities" in obj:
                    for opp in obj["opportunities"]:
                        opp_id = opp.get("id")
                        if opp_id and opp_id not in opportunities_by_id:
                            opportunities_by_id[opp_id] = opp
                idx += new_idx
                # Skip any non-JSON characters (whitespace, commas, etc.) between objects
                while idx < len(content) and (content[idx].isspace() or content[idx] == ','):
                    idx += 1
            except json.JSONDecodeError:
                # If raw_decode fails, try to advance past a single character to find the next JSON
                idx += 1
                while idx < len(content) and (content[idx].isspace() or content[idx] == ','):
                    idx += 1
            except Exception as e:
                print(f"Advertencia: Error inesperado durante la decodificación en la posición {idx}: {e}")
                break # Exit loop if an unexpected error occurs

    except FileNotFoundError:
        print(f"Error: Archivo de oportunidades {file_path} no encontrado.")
        return
    except Exception as e:
        print(f"Ocurrió un error inesperado al leer o procesar el archivo de oportunidades: {e}")
        return

    all_opportunities = list(opportunities_by_id.values())
    print(f"\nTotal de Oportunidades Encontradas (deduplicadas): {len(all_opportunities)}")

    target_pipelines = ["Meta · Instalación", "VSL DIRECTO", "INSTAGRAM", "Clientes Reto Semilla"]

    min_created_at = datetime.max
    max_created_at = datetime.min

    for p_name in target_pipelines:
        p_id = pipeline_names_to_id.get(p_name)
        if not p_id:
            print(f"\n  Pipeline '{p_name}' no encontrado en la configuración. Saltando.")
            continue

        pipeline_opportunities = [opp for opp in all_opportunities if opp.get('pipelineId') == p_id]
        print(f"\n  Pipeline: {p_name} ({len(pipeline_opportunities)} oportunidades)")

        opportunities_count_by_stage = {stage_name: 0 for stage_id, stage_name in pipeline_id_to_stages_ordered.get(p_id, [])}

        email_count = 0
        phone_count = 0
        llamada_agendada_count = 0
        top_sources = {}
        top_campaigns = {}
        top_content = {}
        top_tags = {}

        for opp in pipeline_opportunities:
            stage_id = opp.get('pipelineStageId')
            stage_name = pipeline_id_to_stages.get(p_id, {}).get(stage_id, f"Stage ID: {stage_id}")
            opportunities_count_by_stage[stage_name] = opportunities_count_by_stage.get(stage_name, 0) + 1

            contact_info = opp.get('contact', {})
            if contact_info.get('email'):
                email_count += 1
            if contact_info.get('phone'):
                phone_count += 1

            tags_list = []
            for tag_item in contact_info.get('tags', []):
                tag_name = None
                if isinstance(tag_item, dict) and 'name' in tag_item:
                    tag_name = tag_item['name']
                elif isinstance(tag_item, str):
                    tag_name = tag_item

                if tag_name:
                    top_tags[tag_name] = top_tags.get(tag_name, 0) + 1
                    if tag_name == 'llamada_agendada':
                        llamada_agendada_count += 1

            attributions_raw = opp.get('attributions', {})
            attributions = {}
            if isinstance(attributions_raw, list) and attributions_raw:
                # Assuming the first item in the list is the primary attribution dict
                attributions = attributions_raw[0]
            elif isinstance(attributions_raw, dict):
                attributions = attributions_raw

            source = attributions.get('utmSource') or opp.get('source')
            campaign = attributions.get('utmCampaign')
            content = attributions.get('utmContent')

            if source:
                top_sources[source] = top_sources.get(source, 0) + 1
            if campaign:
                top_campaigns[campaign] = top_campaigns.get(campaign, 0) + 1
            if content:
                top_content[content] = top_content.get(content, 0) + 1

            # Track min/max creation dates
            created_at_str = opp.get('createdAt')
            if created_at_str:
                try:
                    # Make created_at naive for comparison with datetime.min/max
                    created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00')).replace(tzinfo=None)
                    if created_at < min_created_at:
                        min_created_at = created_at
                    if created_at > max_created_at:
                        max_created_at = created_at
                except ValueError:
                    # Handle cases where datetime format might be inconsistent
                    pass

        for stage_id, stage_name in pipeline_id_to_stages_ordered.get(p_id, []):
            count = opportunities_count_by_stage.get(stage_name, 0)
            print(f"    - {stage_name}: {count} oportunidades")

        if p_name in ["Meta · Instalación", "VSL DIRECTO"]:
            print(f"    Oportunidades con Email: {email_count}")
            print(f"    Oportunidades con Teléfono: {phone_count}")
            print(f"    Oportunidades con tag 'llamada_agendada': {llamada_agendada_count}")

            if top_sources:
                print(f"    Top Sources (Top 3): {json.dumps(sorted(top_sources.items(), key=lambda item: item[1], reverse=True)[:3], ensure_ascii=False)}")
            if top_campaigns:
                print(f"    Top Campaigns (Top 3): {json.dumps(sorted(top_campaigns.items(), key=lambda item: item[1], reverse=True)[:3], ensure_ascii=False)}")
            if top_content:
                print(f"    Top Content (Top 3): {json.dumps(sorted(top_content.items(), key=lambda item: item[1], reverse=True)[:3], ensure_ascii=False)}")
            if top_tags:
                print(f"    Top Tags (Top 3): {json.dumps(sorted(top_tags.items(), key=lambda item: item[1], reverse=True)[:3], ensure_ascii=False)}")

    if min_created_at != datetime.max and max_created_at != datetime.min:
        print(f"\nFecha más antigua de oportunidad: {min_created_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"Fecha más reciente de oportunidad: {max_created_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"Rango total de datos: {(max_created_at - min_created_at).days} días")
    else:
        print("\nNo se pudieron determinar las fechas de creación de las oportunidades.")

if __name__ == "__main__":
    generar_resumen_ghl()

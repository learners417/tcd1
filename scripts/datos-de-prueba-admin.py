"""DATOS DE PRUEBA PARA EL ADMIN — seis clientes en seis momentos distintos.

═══ POR QUÉ HACÍA FALTA ═══

El Admin lee de Supabase (`cargarClientes` arranca con `if (!supabase)
return`). El visor no le da ninguna, así que TODAS las mediciones del Admin
—las diecisiete pestañas— eran del estado vacío: `admin:clientes` daba 96
palabras, y esas 96 palabras son «todavía no hay clientes con el Camino
andando».

Medir el estado vacío y rediseñar con eso es diseñar a ciegas. La pantalla
que importa es la que ve quien abre el panel un martes con seis personas
adentro, cada una en un momento distinto del Camino.

═══ CÓMO FUNCIONA, SIN TOCAR PRODUCCIÓN ═══

Nada de esto vive en `src/`. Son dos piezas, las dos del lado del andamiaje:

1 · `medir-app.py` arranca Vite con `VITE_SUPABASE_URL` apuntando a un host
    que no existe. Con eso `src/lib/supabase.ts` SÍ crea su cliente y la app
    se comporta como si estuviera conectada.

2 · Playwright intercepta esas llamadas con `page.route` y responde con las
    filas de acá. La app no sabe que no hay nadie del otro lado.

Así el código de producción no tiene ni una línea de prueba, y el día que
cambie la forma de una consulta, estos datos dejan de calzar y se nota.

═══ LOS SEIS ═══

Elegidos para que cada estado del semáforo tenga a alguien: quien va al día,
quien se atrasó, quien se atrasó MUCHO, quien recién entra, quien terminó, y
quien pidió la pausa. Si un rediseño del panel rompe uno de los seis, se ve
en la captura.
"""
from datetime import date, timedelta

HOY = date(2026, 11, 6)


def _hace(dias: int) -> str:
    return (HOY - timedelta(days=dias)).isoformat()


# Cada fila imita lo que devuelve `get_all_profiles`. Los nombres son
# inventados y no corresponden a ninguna persona real.
CLIENTES = [
    {
        'id': '11111111-1111-4111-8111-111111111111',
        'nombre': 'Marina Ortiz', 'email': 'marina@ejemplo.test',
        'especialidad': 'Nutrición', 'rol': 'cliente', 'status': 'activo',
        'fecha_inicio': _hace(71), 'onboarding_completed': True,
        'plan_comercial': 'negro', 'servicio_contratado': 'mentoria',
        'acceso_tipo': 'noventa', 'acceso_hasta': None, 'cima_incluida': True,
        'biblioteca_abierta': True, 'pasos_completados': 64,
    },
    {
        'id': '22222222-2222-4222-8222-222222222222',
        'nombre': 'Tomás Vera', 'email': 'tomas@ejemplo.test',
        'especialidad': 'Coaching', 'rol': 'cliente', 'status': 'activo',
        'fecha_inicio': _hace(40), 'onboarding_completed': True,
        'plan_comercial': 'verde', 'servicio_contratado': 'mentoria',
        'acceso_tipo': 'noventa', 'acceso_hasta': None, 'cima_incluida': False,
        'biblioteca_abierta': True, 'pasos_completados': 22,
    },
    {
        'id': '33333333-3333-4333-8333-333333333333',
        'nombre': 'Lucía Peralta', 'email': 'lucia@ejemplo.test',
        'especialidad': 'Terapia', 'rol': 'cliente', 'status': 'activo',
        'fecha_inicio': _hace(55), 'onboarding_completed': True,
        'plan_comercial': 'verde', 'servicio_contratado': 'mentoria',
        'acceso_tipo': 'noventa', 'acceso_hasta': None, 'cima_incluida': False,
        'biblioteca_abierta': False, 'pasos_completados': 9,
    },
    {
        'id': '44444444-4444-4444-8444-444444444444',
        'nombre': 'Hernán Robles', 'email': 'hernan@ejemplo.test',
        'especialidad': 'Kinesiología', 'rol': 'cliente', 'status': 'activo',
        'fecha_inicio': _hace(2), 'onboarding_completed': False,
        'plan_comercial': 'blanco', 'servicio_contratado': 'app',
        'acceso_tipo': 'noventa', 'acceso_hasta': None, 'cima_incluida': False,
        'biblioteca_abierta': False, 'pasos_completados': 0,
    },
    {
        'id': '55555555-5555-4555-8555-555555555555',
        'nombre': 'Paula Núñez', 'email': 'paula@ejemplo.test',
        'especialidad': 'Nutrición', 'rol': 'cliente', 'status': 'activo',
        'fecha_inicio': _hace(96), 'onboarding_completed': True,
        'plan_comercial': 'negro', 'servicio_contratado': 'mentoria',
        'acceso_tipo': 'anual', 'acceso_hasta': '2027-08-01', 'cima_incluida': True,
        'biblioteca_abierta': True, 'pasos_completados': 91,
    },
    {
        'id': '66666666-6666-4666-8666-666666666666',
        'nombre': 'Diego Sosa', 'email': 'diego@ejemplo.test',
        'especialidad': 'Coaching', 'rol': 'cliente', 'status': 'pausado',
        'fecha_inicio': _hace(30), 'onboarding_completed': True,
        'plan_comercial': 'verde', 'servicio_contratado': 'mentoria',
        'acceso_tipo': 'noventa', 'acceso_hasta': None, 'cima_incluida': False,
        'biblioteca_abierta': True, 'pasos_completados': 14,
    },
]


def instalar(ctx):
    """Hace que las llamadas a Supabase del Admin respondan con los seis.

    Se instala en el CONTEXTO y no en cada página: `medir-app.py` abre
    diecisiete páginas distintas y engancharlas de a una es la clase de cosa
    que funciona hasta que alguien agrega la decimoctava.

    Lo que no se reconoce vuelve como lista vacía, que es lo que la app ya
    sabe manejar: así una consulta nueva no revienta la medición, solo sale
    sin filas — y eso se ve en la captura, que es donde tiene que verse.
    """
    def responder(ruta):
        url = ruta.request.url
        cuerpo = '[]'
        if 'get_all_profiles' in url or '/profiles' in url:
            import json
            cuerpo = json.dumps(CLIENTES)
        ruta.fulfill(status=200, content_type='application/json', body=cuerpo,
                     headers={'access-control-allow-origin': '*'})

    ctx.route('**/rest/v1/**', responder)
    ctx.route('**/auth/v1/**', lambda r: r.fulfill(
        status=200, content_type='application/json', body='{}',
        headers={'access-control-allow-origin': '*'}))

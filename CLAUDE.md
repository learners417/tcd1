# Claude Code Guidelines

## Integraciones con APIs Externas

Para las integraciones con GoHighLevel (LeadConnector) y Meta (Facebook/Instagram), siempre se deben realizar llamadas directas a sus APIs. La autenticación debe manejarse leyendo las claves de API o tokens de acceso directamente desde el archivo `.env` del proyecto, utilizando mecanismos como `os.environ` en Python o librerías como `python-dotenv`. **Nunca** se debe hardcodear el token en comandos de consola ni utilizar los conectores OAuth proporcionados por Claude.ai para estas plataformas.

Esto asegura un control directo sobre la autenticación y evita dependencias de configuraciones de conectores externos para servicios críticos.

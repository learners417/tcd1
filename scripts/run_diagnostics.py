import os

# Añadir el directorio de scripts al PATH para que los módulos puedan encontrarse si no están en el mismo directorio
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from diagnostico_meta import diagnostico_meta
from diagnostico_ghl import diagnostico_ghl

if __name__ == "__main__":
    diagnostico_meta()
    diagnostico_ghl()

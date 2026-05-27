# Component Guide

Quick reference for components and design tokens. Use exact names — do not rename or create synonyms.

## Token Quick Reference

```json
{
  "colors": {
    "primary": "#C8102E",
    "primary_dark": "#A00D24",
    "primary_light": "#FCE4EC",
    "secondary": "#4A4A4A",
    "secondary_light": "#F5F5F5",
    "background": "#FFFFFF",
    "surface": "#FAFAFA",
    "text_primary": "#212121",
    "text_secondary": "#757575",
    "text_on_primary": "#FFFFFF",
    "border": "#E0E0E0",
    "success": "#4CAF50",
    "warning": "#FFC107",
    "danger": "#F44336",
    "info": "#2196F3",
    "semaphore_red": "#F44336",
    "semaphore_yellow": "#FFC107",
    "semaphore_green": "#4CAF50"
  },
  "typography": {
    "font_family": "Inter, sans-serif",
    "headings": {
      "h1": {
        "size": 32,
        "weight": 700,
        "line_height": 1.2
      },
      "h2": {
        "size": 24,
        "weight": 600,
        "line_height": 1.3
      },
      "h3": {
        "size": 20,
        "weight": 600,
        "line_height": 1.4
      },
      "h4": {
        "size": 18,
        "weight": 500,
        "line_height": 1.4
      }
    },
    "body": {
      "large": {
        "size": 16,
        "weight": 400,
        "line_height": 1.5
      },
      "medium": {
        "size": 14,
        "weight": 400,
        "line_height": 1.5
      },
      "small": {
        "size": 12,
        "weight": 400,
        "line_height": 1.4
      }
    },
    "label": {
      "size": 12,
      "weight": 600,
      "letter_spacing": 0.5,
      "text_transform": "uppercase"
    },
    "caption": {
      "size": 11,
      "weight": 400,
      "line_height": 1.3
    }
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32,
    "xxl": 48
  },
  "border_radius": {
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "full": 9999
  },
  "shadows": {
    "card": "0 2px 4px rgba(0,0,0,0.08)",
    "elevated": "0 4px 12px rgba(0,0,0,0.12)",
    "modal": "0 8px 24px rgba(0,0,0,0.16)"
  },
  "iconography": {
    "style": "outline",
    "size_sm": 16,
    "size_md": 20,
    "size_lg": 24
  },
  "motion": {
    "duration_fast": 150,
    "duration_normal": 300,
    "easing": "ease-in-out"
  }
}
```

## Available Components

- **Navegación Principal**: Barra lateral izquierda colapsable con iconos y etiquetas. Incluye logo de Cencosud, enlaces a Dashboard, Noticias, Reportes, Configuración, KPIs, Perfil. Indicador de página activa con color primario.
- **Botón CTA Primario**: Fondo rojo Cencosud (#C8102E), texto blanco, border-radius 8px, padding 12px 24px, hover más oscuro, transición suave. Usado para acciones principales como 'Generar Reporte', 'Aplicar Filtros', 'Guardar Configuración'.
- **Tarjeta de Noticia**: Contenedor con sombra card, border-radius 8px, padding 16px. Incluye: indicador de semáforo (círculo rojo/amarillo/verde), título de noticia (h4), fuente y fecha (caption), snippet (body small), etiquetas de país y categoría (chips), botón de feedback (útil/poco útil).
- **Semáforo de Prioridad**: Indicador visual circular de 12px de diámetro con color según prioridad: rojo (#F44336) para alta, amarillo (#FFC107) para media, verde (#4CAF50) para baja. Puede incluir tooltip con el score numérico.
- **Chip / Etiqueta**: Pequeño contenedor redondeado con texto y color de fondo suave. Usado para país (ej. Chile, Argentina) y categoría (ej. Regulación, Competencia).
- **Barra de Búsqueda y Filtros**: Input de búsqueda con icono de lupa, acompañado de dropdowns para filtrar por país, categoría, rango de score, fecha. Botón de aplicar y limpiar.
- **Tabla de Datos**: Tabla responsive con columnas: título, fuente, país, score, semáforo, fecha, acciones. Filas alternadas con color de fondo. Encabezados fijos. Paginación inferior.
- **Gráfico / Chart**: Componente de visualización de datos (barras, líneas, dona) usando colores de la paleta. Incluye leyenda y tooltip interactivo.
- **Modal / Diálogo**: Ventana emergente centrada con overlay semitransparente. Título, contenido, botones de acción (primario y secundario). Cierre con X o clic fuera.
- **Formulario de Configuración**: Grupo de campos con etiquetas, inputs, sliders, checkboxes, botones de guardar/cancelar. Validación en línea.

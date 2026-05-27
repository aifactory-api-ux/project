# UI/UX Design Contract

> **READ THIS FILE BEFORE IMPLEMENTING ANY FRONTEND COMPONENT.**
> This is the single source of truth for all visual and functional requirements.

## Figma Source

File URL: https://www.figma.com/design/yNAE0pve4t73opHZQDLbWh?node-id=10-2

## Visual Direction

Diseño corporativo, profesional y limpio, con énfasis en la claridad de la información y la jerarquía visual del semáforo de prioridad. Uso de colores institucionales de Cencosud (rojo corporativo, grises neutros, blanco) y acentos de semáforo (rojo, amarillo, verde) para indicar prioridad. Tipografía sans-serif moderna (Inter) para legibilidad en dashboards. Iconografía simple y coherente. Tarjetas de noticias con sombras suaves y bordes redondeados. Gráficos de barras y métricas claras.

## Pages / Figma Frames

### 1. Dashboard Principal

### 2. Lista de Noticias

### 3. Detalle de Noticia

### 4. Reportes Dinámicos

## Design Tokens

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

## Base Components

### `Navegación Principal`
Barra lateral izquierda colapsable con iconos y etiquetas. Incluye logo de Cencosud, enlaces a Dashboard, Noticias, Reportes, Configuración, KPIs, Perfil. Indicador de página activa con color primario.

### `Botón CTA Primario`
Fondo rojo Cencosud (#C8102E), texto blanco, border-radius 8px, padding 12px 24px, hover más oscuro, transición suave. Usado para acciones principales como 'Generar Reporte', 'Aplicar Filtros', 'Guardar Configuración'.

### `Tarjeta de Noticia`
Contenedor con sombra card, border-radius 8px, padding 16px. Incluye: indicador de semáforo (círculo rojo/amarillo/verde), título de noticia (h4), fuente y fecha (caption), snippet (body small), etiquetas de país y categoría (chips), botón de feedback (útil/poco útil).

### `Semáforo de Prioridad`
Indicador visual circular de 12px de diámetro con color según prioridad: rojo (#F44336) para alta, amarillo (#FFC107) para media, verde (#4CAF50) para baja. Puede incluir tooltip con el score numérico.

### `Chip / Etiqueta`
Pequeño contenedor redondeado con texto y color de fondo suave. Usado para país (ej. Chile, Argentina) y categoría (ej. Regulación, Competencia).

### `Barra de Búsqueda y Filtros`
Input de búsqueda con icono de lupa, acompañado de dropdowns para filtrar por país, categoría, rango de score, fecha. Botón de aplicar y limpiar.

### `Tabla de Datos`
Tabla responsive con columnas: título, fuente, país, score, semáforo, fecha, acciones. Filas alternadas con color de fondo. Encabezados fijos. Paginación inferior.

### `Gráfico / Chart`
Componente de visualización de datos (barras, líneas, dona) usando colores de la paleta. Incluye leyenda y tooltip interactivo.

### `Modal / Diálogo`
Ventana emergente centrada con overlay semitransparente. Título, contenido, botones de acción (primario y secundario). Cierre con X o clic fuera.

### `Formulario de Configuración`
Grupo de campos con etiquetas, inputs, sliders, checkboxes, botones de guardar/cancelar. Validación en línea.


## Preliminary Spec

```json
{
  "visual_references": [],
  "constraints": [],
  "sections_or_pages": [],
  "confirmed_assumptions": [],
  "ready_for_phase_2": true,
  "status": "complete",
  "open_questions": [],
  "gaps_to_resolve": []
}
```

## Figma Design Context (layout, spacing, component tree)

```json
{
  "success": true,
  "result": {
    "success": true,
    "action": "get_design_context",
    "auth_required": false,
    "message": "Retrieved design context for node 10:2.",
    "figma": {
      "file_key": "yNAE0pve4t73opHZQDLbWh",
      "node_id": "10:2",
      "file_url": "https://www.figma.com/design/yNAE0pve4t73opHZQDLbWh?node-id=10-2",
      "implementation_target": "React + TypeScript + Tailwind CSS",
      "context_available": true
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": null
}
```

## Figma Variable Definitions (token names + values)

```json
{
  "success": true,
  "result": {
    "success": true,
    "action": "get_variable_defs",
    "auth_required": false,
    "message": "Variable definitions retrieved; no variables were returned for node 10:2.",
    "figma": {
      "file_key": "yNAE0pve4t73opHZQDLbWh",
      "node_id": "10:2",
      "variables": {}
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": null
}
```

## Code Connect Map (Figma component → code file)

```json
{
  "success": false,
  "result": {
    "success": false,
    "action": "get_code_connect_map",
    "auth_required": false,
    "message": "Code Connect is unavailable for this Figma account: a Developer seat in an Organization or Enterprise plan is required.",
    "figma": {
      "file_key": "yNAE0pve4t73opHZQDLbWh",
      "node_id": "10:2",
      "debug_uuid": "54018bef-65aa-479f-bdf1-fffb9690ce39",
      "code_connect_map": null
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": null,
  "error": "Code Connect is unavailable for this Figma account: a Developer seat in an Organization or Enterprise plan is required."
}
```

## Design System Rules

```json
{
  "success": true,
  "result": {
    "success": true,
    "action": "create_design_system_rules",
    "auth_required": false,
    "message": "Generated React + TypeScript + Tailwind design system implementation rules from the Figma node context.",
    "figma": {
      "file_key": "yNAE0pve4t73opHZQDLbWh",
      "file_url": "https://www.figma.com/design/yNAE0pve4t73opHZQDLbWh?node-id=10-2",
      "node_id": "10:2",
      "node_url": "https://www.figma.com/design/yNAE0pve4t73opHZQDLbWh?node-id=10-2",
      "implementation_target": "React + TypeScript + Tailwind CSS",
      "suggested_path": "docs/design-system-rules.md",
      "rules": "Use React functional components with TypeScript props for reusable UI primitives. Use Tailwind CSS utility classes directly and map repeated values into project tokens when available. Preserve Figma node hierarchy as component hierarchy: page frame, navigation, hero/header, filter controls, report preview, side panel, and status footer. Use Inter as the primary font with weights Regular, Medium, Semi Bold, and Bold. Core colors: background #FAFAFA, surface #FFFFFF, text-primary #212121, text-secondary #757575, border #E0E0E0, brand-primary #C8102E, brand-tint #FCE4EC, success #4CAF50, warning #FFC107, danger #F44336, info #2196F3. Use 8px border radius for buttons, cards, filters, and chart containers; use 999px radius only for chips/pills and progress bars. Use spacing based on the visible Figma scale: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, and 48px. Main desktop screen width is 1440px. Navigation height is 72px with 32px horizontal padding. Content sections stack vertically without overlap. Cards use white fill, #E0E0E0 border, 8px radius, 24px padding, and subtle shadow 0 2px 4px rgba(0,0,0,0.08). Primary buttons use #C8102E background, white text, 14px Semi Bold, 20px horizontal padding, 12px vertical padding, and 8px radius. Secondary buttons use #F5F5F5 or white backgrounds with #212121 or #C8102E text depending on emphasis. Chips use 12px Semi Bold text with 10px horizontal and 6px vertical padding. Use exact Spanish labels from Figma for navigation and UI copy. Keep data-node-id attributes when useful for implementation traceability. For responsive layouts, keep the same content and labels while adapting only layout density: collapse horizontal filter rows into stacked controls on smaller screens, allow cards to wrap, and keep action hierarchy visible."
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": null
}
```

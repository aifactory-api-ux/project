# UI/UX Design Contract

> **READ THIS FILE BEFORE IMPLEMENTING ANY FRONTEND COMPONENT.**
> This is the single source of truth for all visual and functional requirements.

## Figma Source

File URL: https://www.figma.com/design/J3k9BQl6Vp2EHnzbKxws1A/?node-id=9-2

## Visual Direction

Diseño limpio, acogedor y centrado en el producto, con una paleta de colores cálidos y naturales que evocan la ternura y el cuidado de los gatos. Tipografía sans-serif legible, imágenes de productos de alta calidad y elementos gráficos sutiles (huellas, siluetas felinas) para reforzar el nicho. La interfaz debe transmitir confianza, facilidad de uso y una experiencia de compra placentera.

## Pages / Figma Frames

### 1. Inicio (Home)
- **description**: Hero con imagen de gato y CTA 'Ver productos'. Secciones: categorías destacadas, productos más vendidos, testimonios, newsletter.

### 2. Catálogo de Productos
- **description**: Grid de cards de producto con filtros laterales (categoría, precio, valoración) y ordenación. Paginación o carga infinita.

### 3. Detalle de Producto
- **description**: Imagen grande del producto, galería de imágenes, nombre, precio, descripción, selector de cantidad, botón añadir al carrito, reseñas.

### 4. Carrito de Compras
- **description**: Lista de productos añadidos con imagen, nombre, precio, cantidad, subtotal. Resumen del pedido (subtotal, envío, total). Botón 'Proceder al pago'.

## Design Tokens

```json
{
  "colors": {
    "primary": "#F28C28",
    "primary_light": "#FDBF60",
    "primary_dark": "#C76A1A",
    "secondary": "#4A90D9",
    "secondary_light": "#7AB3E8",
    "secondary_dark": "#2C6FAC",
    "accent": "#E85D75",
    "neutral_white": "#FFFFFF",
    "neutral_light": "#F5F5F5",
    "neutral_medium": "#E0E0E0",
    "neutral_dark": "#333333",
    "neutral_black": "#1A1A1A",
    "success": "#27AE60",
    "warning": "#F39C12",
    "error": "#E74C3C",
    "info": "#3498DB"
  },
  "typography": {
    "font_family": "'Inter', sans-serif",
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
      "regular": {
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
    "button": {
      "size": 16,
      "weight": 600,
      "line_height": 1.2
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
    "xxl": 48,
    "section": 64
  },
  "border_radius": {
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "full": 9999
  },
  "shadows": {
    "card": "0 2px 8px rgba(0,0,0,0.08)",
    "elevated": "0 4px 16px rgba(0,0,0,0.12)",
    "modal": "0 8px 32px rgba(0,0,0,0.2)"
  },
  "icon_image_style": "Iconos lineales con grosor de 2px, esquinas redondeadas. Im\u00e1genes de productos con fondo blanco o transparente, recortadas limpiamente, con sombra suave. Uso de iconos de huella de gato como elemento decorativo.",
  "motion_interaction": "Transiciones suaves de 0.2s a 0.3s para hover y focus. Animaciones de carga sutiles (spinner con huella). Microinteracciones en botones (cambio de color, elevaci\u00f3n)."
}
```

## Base Components

### `Navbar Principal`
Barra de navegación superior fija con logo, enlaces a categorías, icono de carrito con contador, y menú de usuario (iniciar sesión/perfil). Responsive: se convierte en menú hamburguesa en móvil.

### `CTA Button (Primario)`
Botón principal con fondo primary, texto blanco, border-radius md, hover con primary_dark. Usado para 'Añadir al carrito', 'Comprar ahora', 'Finalizar pedido'.

### `Card de Producto`
Tarjeta con imagen del producto, nombre, precio, valoración (estrellas), y botón de añadir al carrito. Sombra card, border-radius lg. Hover eleva la sombra.

### `Input de Formulario`
Campo de texto con borde neutral_medium, focus con primary, label flotante o superior. Incluye estado de error con mensaje.

### `Footer`
Pie de página con enlaces rápidos, información de contacto, redes sociales, y copyright. Fondo neutral_dark, texto blanco.

### `Breadcrumb`
Navegación de migas de pan para páginas internas (ej. Inicio > Catálogo > Producto).

### `Rating Stars`
Componente de valoración con estrellas interactivas (rellenas/vacías) y puntuación numérica.

### `Modal / Diálogo`
Ventana modal con overlay, título, contenido, y botones de acción. Usado para confirmaciones o alertas.

### `Badge / Etiqueta`
Etiqueta pequeña para indicar descuento, nuevo, oferta. Fondo accent o primary, texto blanco.

### `Spinner / Loader`
Indicador de carga circular con icono de huella de gato animado.


## Preliminary Spec

```json
{
  "site_goal": "Establecer una plataforma de comercio electr\u00f3nico especializada en productos para gatos, resolviendo la necesidad de un canal de venta online dedicado, expandiendo el mercado, ofreciendo una experiencia de compra conveniente y posicionando al negocio como referente en el nicho felino.",
  "audience": "Due\u00f1os de gatos, con un perfil que valora la comodidad de comprar online y busca productos espec\u00edficos y de calidad para sus mascotas. Usuarios secundarios podr\u00edan ser personas buscando regalos para amantes de los gatos.",
  "readiness_reason": "El usuario ha confirmado el resumen del proyecto y ha solicitado proceder con la creaci\u00f3n de los artefactos del proyecto (documentaci\u00f3n, backlog y handoff al arquitecto).",
  "visual_references": [],
  "constraints": [
    "Presupuesto inicial para el desarrollo y lanzamiento del MVP a\u00fan no definido.",
    "No se ha establecido una fecha l\u00edmite espec\u00edfica para el lanzamiento del MVP.",
    "La plataforma deber\u00e1 ser compatible con est\u00e1ndares actuales de comercio electr\u00f3nico y pasarelas de pago seguras, con escalabilidad futura.",
    "Cumplimiento con normativas de protecci\u00f3n de datos (GDPR o equivalentes locales) y leyes de comercio electr\u00f3nico.",
    "La disponibilidad del equipo de desarrollo y otros recursos (dise\u00f1o, marketing) a\u00fan no est\u00e1 confirmada."
  ],
  "sections_or_pages": [
    "Cat\u00e1logo de productos (Gesti\u00f3n y visualizaci\u00f3n de productos para gatos)",
    "Carrito de compras y checkout (Funcionalidad para agregar productos, gestionar cantidades y realizar el pedido)",
    "Gesti\u00f3n de pedidos (Visualizaci\u00f3n y seguimiento de pedidos realizados por el cliente)"
  ],
  "confirmed_assumptions": [
    "El proyecto busca resolver la ausencia de un canal de venta online especializado en productos para gatos para expandir el negocio.",
    "La soluci\u00f3n es una plataforma de comercio electr\u00f3nico dedicada a art\u00edculos felinos.",
    "La iniciativa generar\u00e1 un aumento significativo en las ventas y fortalecer\u00e1 la presencia de la marca en un nicho de mercado espec\u00edfico.",
    "Los usuarios primarios son due\u00f1os de gatos que valoran la comodidad de comprar online y buscan productos espec\u00edficos y de calidad.",
    "El administrador principal ser\u00e1 el propietario del negocio, responsable de la gesti\u00f3n de inventario, pedidos y atenci\u00f3n al cliente.",
    "El \u00e9xito se medir\u00e1 por tasa de conversi\u00f3n, ingresos por ventas, NPS, n\u00famero de pedidos mensuales y tr\u00e1fico web.",
    "Los stakeholders clave incluyen: Sponsor Ejecutivo (propietario), Product Owner (asistente virtual), Usuarios Finales (due\u00f1os de gatos), Equipo de Desarrollo y Proveedores de Productos."
  ],
  "design_requirements": {
    "content_needs": "Cat\u00e1logo variado, descripciones detalladas de productos.",
    "interaction_needs": "Facilidad de navegaci\u00f3n, proceso de compra intuitivo, opciones de env\u00edo eficientes.",
    "responsive_accessibility": "Acceso a trav\u00e9s de navegadores web en dispositivos m\u00f3viles y de escritorio."
  },
  "ready_for_phase_2": true,
  "status": "complete",
  "open_questions": [],
  "gaps_to_resolve": [
    "Definici\u00f3n de tipos de productos espec\u00edficos a vender (alimentos, juguetes, accesorios, etc.).",
    "Funcionalidades clave deseadas para la tienda (rese\u00f1as, suscripciones, perfiles de usuario, etc.) m\u00e1s all\u00e1 de lo b\u00e1sico.",
    "Fecha tentativa o plazo deseado para el lanzamiento del e-commerce.",
    "Presupuesto estimado disponible para el desarrollo y operaci\u00f3n de la plataforma.",
    "Preferencias o requisitos espec\u00edficos sobre la tecnolog\u00eda a utilizar o plataformas existentes con las que integrar."
  ]
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
    "message": "Retrieved design context for node 9:2 from Figma.",
    "figma": {
      "file_key": "J3k9BQl6Vp2EHnzbKxws1A",
      "node_id": "9:2",
      "file_url": "https://www.figma.com/design/J3k9BQl6Vp2EHnzbKxws1A/?node-id=9-2",
      "client_frameworks": [
        "React"
      ],
      "client_languages": [
        "TypeScript"
      ],
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
    "message": "Variable definitions retrieved; no variables were returned for node 9:2.",
    "figma": {
      "file_key": "J3k9BQl6Vp2EHnzbKxws1A",
      "node_id": "9:2",
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
    "message": "Code Connect access is unavailable for the authenticated Figma account: a Developer seat in an Organization or Enterprise plan is required.",
    "figma": {
      "file_key": "J3k9BQl6Vp2EHnzbKxws1A",
      "node_id": "9:2",
      "code_connect_label": "React",
      "debug_uuid": "55a3cc12-9049-4b26-af78-43e6e68ac47f"
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": null,
  "error": "Code Connect access is unavailable for the authenticated Figma account: a Developer seat in an Organization or Enterprise plan is required."
}
```

## Design System Rules

```json
{
  "success": false,
  "result": {
    "success": false,
    "action": "create_design_system_rules",
    "auth_required": false,
    "message": "The configured Figma MCP tools do not expose create_design_system_rules in this session, so the action could not be completed without using unsupported tools.",
    "figma": {
      "file_key": "J3k9BQl6Vp2EHnzbKxws1A",
      "file_url": "https://www.figma.com/design/J3k9BQl6Vp2EHnzbKxws1A/?node-id=9-2"
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": null,
  "error": "The configured Figma MCP tools do not expose create_design_system_rules in this session, so the action could not be completed without using unsupported tools."
}
```

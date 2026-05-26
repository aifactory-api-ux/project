# Component Guide

Quick reference for components and design tokens. Use exact names — do not rename or create synonyms.

## Token Quick Reference

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

## Available Components

- **Navbar Principal**: Barra de navegación superior fija con logo, enlaces a categorías, icono de carrito con contador, y menú de usuario (iniciar sesión/perfil). Responsive: se convierte en menú hamburguesa en móvil.
- **CTA Button (Primario)**: Botón principal con fondo primary, texto blanco, border-radius md, hover con primary_dark. Usado para 'Añadir al carrito', 'Comprar ahora', 'Finalizar pedido'.
- **Card de Producto**: Tarjeta con imagen del producto, nombre, precio, valoración (estrellas), y botón de añadir al carrito. Sombra card, border-radius lg. Hover eleva la sombra.
- **Input de Formulario**: Campo de texto con borde neutral_medium, focus con primary, label flotante o superior. Incluye estado de error con mensaje.
- **Footer**: Pie de página con enlaces rápidos, información de contacto, redes sociales, y copyright. Fondo neutral_dark, texto blanco.
- **Breadcrumb**: Navegación de migas de pan para páginas internas (ej. Inicio > Catálogo > Producto).
- **Rating Stars**: Componente de valoración con estrellas interactivas (rellenas/vacías) y puntuación numérica.
- **Modal / Diálogo**: Ventana modal con overlay, título, contenido, y botones de acción. Usado para confirmaciones o alertas.
- **Badge / Etiqueta**: Etiqueta pequeña para indicar descuento, nuevo, oferta. Fondo accent o primary, texto blanco.
- **Spinner / Loader**: Indicador de carga circular con icono de huella de gato animado.

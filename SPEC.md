# Padel Dominical - Spec

## 1. Project Overview

- **Nombre**: Padel Dominical
- **Tipo**: Webapp responsive (mobile-first)
- **Funcionalidad**: Gestión de convocatorias de pádel semanal. Los jugadores se apuntan a un partido semanal y el sistema crea pistas de 4 en 4 por orden de inscripción.
- **Target**: Grupo de amigos que juegan pádel los domingos

## 2. UI/UX Specification

### Layout Structure
- Mobile-first, diseño vertical
- Header fijo con título
- Contenido scrollable
- Footer con acción principal

### Responsive
- Mobile: 100% ancho
- Tablet/Desktop: max-width 480px centrado

### Visual Design

**Paleta de colores**
- Fondo: `#1a1a2e` (azul oscuro)
- Cards: `#16213e` (azul medio)
- Acento: `#e94560` (rojo/coral)
- Texto principal: `#eaeaea`
- Texto secundario: `#8b8b9a`
- Verde success: `#4ecca3`

**Tipografía**
- Headings: "Outfit", bold, 700
- Body: "Outfit", regular, 400
- Nombres jugador: 18px
- Labels: 14px

**Espaciado**
- Card padding: 16px
- Gap entre elements: 12px
- Border radius: 12px

### Components

**Header**
- Título "Padel Dominical"
- Fecha del próximo partido

**Lista de Jugadores Apuntados**
- Tarjetas con nombre
- Indicador ordinal (#1, #2, etc)
- Animación pulse al añadir

**Pistas**
- Tarjetas de pistas (Pista 1, Pista 2...)
- Lista de 4 jugadores por pista
- Badge cuando está completa (4/4)

**Formulario de Inscripción**
- Input nombre jugador
- Botón "Me apunto!" ( disabled si ya inscrito)

**Empty State**
- Mensaje cuando no hay nadie apunt

## 3. Functionality Specification

### Core Features
1. **Ver convocatoria actual**: Muestra fecha del domingo y lista de inscritos
2. **Apuntar jugador**: Insertar nombre, se añade a la cola
3. **Orden automático**: Los primeros 4 van a Pista 1, siguientes 4 a Pista 2, etc
4. **Desapuntar**:(opcional) Quitar inscripción
5. **Reset semanal**: Botón para nova setmana (solo admin/localStorage)
6. **Persistencia**: LocalStorage para datos

### User Flow
1. Usuario abre la web
2. Ve quién está apuntado y qué pistas hay
3. Escribe su nombre y pulsa "Me apunto!"
4. Se añade a la lista / pista correspondiente

### Data Model
```js
{
  domingoActual: "2026-05-03",
  inscripciones: [
    { nombre: "Juan", timestamp: 1715000000 },
    { nombre: "Pedro", timestamp: 1715000100 }
  ]
}
```

### Edge Cases
- Nombre vacío → no permitir
- Nombre duplicado → warning
- Más de 8 jugadores → crear Pista 3, etc

## 4. Acceptance Criteria

- [ ] Al abrir muestra convocatoria actual
- [ ] Se puede escribir nombre y pulsar botón
- [ ] Jugador aparece en lista con número ordinal
- [ ] Al llegar a 4 se crea automáticamente Pista 1
- [ ] Al llegar a 8 se crea Pista 2
- [ ] Diseño responsive y legible en móvil
- [ ] Datos persisten al recargar
- [ ] Animaciones suaves al añadir
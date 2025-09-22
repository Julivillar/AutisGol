# Autisgol App (Manual Counters) — Bootstrap

Spanish UI. React + TS + Vite + Tailwind. State with Zustand. Validation with Zod. Tests with Vitest + React Testing Library.

## Requisitos
- Node 20+
- pnpm 9+ (o npm/yarn)

## Arranque
```bash
pnpm install
pnpm dev
```
Abre http://localhost:5173

## Tests
```bash
pnpm test
```

## Tailwind
Definido en `tailwind.config.ts`. Estilos base en `src/index.css`.

## Firebase (pendiente de conectar)
- Rellena `.env` desde `.env.example`.
- Reglas en `firestore.rules` (lectura pública, escrituras solo admin via `config/admins`).
- Emuladores configurados en `firebase.json` (no se arrancan aún).

## Siguientes pasos (propuestos)
1. Configurar Firebase Emulator Suite y `config/admins` con tu email.
2. Semillas: colección `players` con 12 jugadores iniciales (slugs).
3. Pantalla “Crear/Editar Partido” (form + tabla de goles) con Zod y tests.
4. Grid de contadores por jugador con Undo/Redo.
5. Dashboard: KPIs + mini-rankings.
6. Tabla de estadísticas (32 columnas).

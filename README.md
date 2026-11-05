# Nexo Proyectos

Dashboard de gestión de proyectos desarrollado para el **Laboratorio 11 de Desarrollo de Aplicaciones Web Avanzado de Tecsup**. Amplía el Ejercicio 02 de la guía `GLAB-S11-EAREVALO-2026-1.docx` con la lógica de la TAREA final.

**Autoría académica:** Naomi Sánchez Chavarría.

## Objetivo académico

Practicar componentes reutilizables, estilización con Tailwind CSS, composición de shadcn/ui y gestión de estado compartido en React. La aplicación relaciona proyectos, integrantes y tareas sin backend ni base de datos.

## Tecnologías

- Next.js 16.4.5 y App Router.
- React 19.3.0 y TypeScript con modo estricto.
- Tailwind CSS 4.3.4 y variables CSS.
- shadcn/ui, Radix UI y Lucide React.
- Calendar de shadcn con React Day Picker y date-fns.
- ESLint y pruebas con `node:test`, sin framework de testing adicional.

## Diseño y organización

El tema usa violeta como color principal, azul suave como apoyo y superficies blancas. Los estados de tareas se distinguen con verde, ámbar y azul; las acciones destructivas usan rojo.

`/dashboard` reúne cinco pestañas: **Resumen, Proyectos, Equipo, Tareas y Configuración**. La portada `/` redirige al Dashboard. La navegación admite desplazamiento horizontal en pantallas pequeñas; las tarjetas se distribuyen en columnas según el ancho disponible y la tabla tiene desplazamiento horizontal. Los formularios extensos permiten desplazamiento dentro del Dialog.

Se incluyen etiquetas de campos, nombres accesibles de botones y checkboxes, enlace para saltar al contenido, mensajes de validación con Alert y navegación de Tabs/Dialog/Select basada en Radix. La revisión visual y de teclado en navegador queda a cargo de la prueba manual final.

## Proyectos

- Creación con nombre, descripción, categoría, prioridad y selección de integrantes.
- Validación de campos, nombres repetidos y referencias a integrantes existentes.
- Estado inicial Planificado y progreso inicial de 0% para proyectos nuevos.
- Detalles del proyecto seleccionado, integrantes y cantidad de tareas asociadas.
- Eliminación con confirmación. Se bloquea si tiene tareas asociadas.
- Cantidad de integrantes calculada desde identificadores únicos.

Los seis proyectos del Ejercicio 02 conservan nombres, descripciones, estados y progresos iniciales. Esos porcentajes son datos del ejemplo; no se presentan como cálculos de productividad. Los contadores de Resumen sí se calculan desde las entidades en memoria.

## Equipo

CRUD de integrantes con los nueve campos de la guía:

| Campo | Uso |
| --- | --- |
| `userId` | Identificador estable |
| `role` | Rol |
| `name` | Nombre |
| `email` | Correo |
| `position` | Puesto |
| `birthdate` | Fecha de nacimiento seleccionada con Calendar |
| `phone` | Teléfono |
| `projectId` | Proyecto principal o `null` |
| `isActive` | Estado activo mediante Switch |

Los formularios permiten crear y editar; el identificador se conserva al editar. Se validan correo, duplicados, fecha de nacimiento anterior a hoy, teléfono y proyecto. La lista muestra iniciales, rol, puesto, correo, asignaciones y estado.

Se conservan los cinco integrantes originales. Como el ejemplo no proporciona teléfono ni nacimiento, esos campos iniciales se muestran como **Sin completar**, sin inventar datos personales; deben completarse al guardar una edición. El estado Ausente del ejemplo se representa como inactivo.

## Tareas y paginación

CRUD con título, descripción, proyecto, estado, prioridad, responsable y fecha límite. Se conservan las cinco tareas originales y sus fechas de ejemplo de 2025; no se presentan como actividad actual real.

Equivalencias de nombres de la guía:

| Guía | Modelo interno |
| --- | --- |
| `description` | `description` |
| `prjectId` | `projectId` |
| `status` | `status` |
| `priority` | `priority` |
| `userId` | `userId` |
| `dateline` | `deadline` |

Se agregan `id` estable y `title` como atributo de presentación. Los estados internos son Pendiente, En progreso y Completado; las prioridades son Baja, Media, Alta y Urgente.

El responsable debe existir y pertenecer al proyecto. Cambiar el proyecto limpia la selección del responsable. Calendar selecciona la fecha límite; las fechas se almacenan como cadenas locales `YYYY-MM-DD` para evitar conversiones de día por UTC.

Pagination divide los registros en páginas, permite avanzar y retroceder, muestra el total y limita la página activa cuando cambia el tamaño o se eliminan registros. Los checkboxes permiten seleccionar filas individuales o las de la página visible; no ejecutan borrados masivos.

## Configuración

Formulario con nombre, correo, preferencia de notificaciones, densidad de tabla cómoda/compacta y cantidad de tareas por página (3, 5, 10 o 20). El guardado valida y actualiza el estado compartido, con confirmación.

La preferencia de notificaciones es simulada: no envía correos ni avisos a servicios externos. La densidad y el tamaño de página se aplican a la tabla de tareas.

## Resumen dinámico

Los indicadores se calculan desde los registros actuales:

- Total de proyectos y proyectos activos (estado distinto de Completado).
- Total de integrantes e integrantes activos.
- Total de tareas, pendientes, en progreso y completadas.

Se actualizan después de las operaciones CRUD y cambios de estado. Las vistas vacías muestran mensajes y los cálculos evitan divisiones por cero.

## Estado compartido y relaciones

`DashboardProvider` utiliza React Context y estado de React. `applyAction` centraliza las validaciones y transiciones inmutables; `metrics` y `paginate` son funciones puras. La lógica no se concentra en la página.

Un integrante puede participar en varios proyectos mediante `Project.memberIds` y tener un proyecto principal en `Member.projectId`. Al trasladar el proyecto principal, se conserva la membresía anterior si aún tiene tareas allí; de lo contrario se retira esa asignación anterior. Al crear un proyecto con integrantes sin proyecto principal, se les asigna ese proyecto como principal.

Políticas de integridad:

1. No se elimina un proyecto con tareas; primero hay que reasignar o eliminar esas tareas.
2. No se elimina un integrante con tareas; primero hay que reasignarlas o eliminarlas.
3. Eliminar un proyecto válido libera los proyectos principales de sus integrantes.
4. Eliminar un integrante válido lo retira de todas las listas de miembros de proyectos.
5. Toda tarea conserva un proyecto existente y un responsable que participa en él.

Las operaciones simulan una espera local de 450 ms con Spinner. Un bloqueo compartido impide operaciones simultáneas y dobles envíos. No se realiza ninguna petición a un backend.

**Los cambios solo viven en memoria: se conservan al cambiar de pestaña y se reinician al recargar la aplicación.** Cada pestaña independiente del navegador tiene su propia sesión. No se usa localStorage, una API, autenticación real ni una base de datos.

## Componentes shadcn/ui

Button, Card, Input, Label, Dialog, Tabs, Select, Badge, Avatar, Form, Switch, Table y Checkbox se conservan del Ejercicio 02. La TAREA incorpora **Spinner, Alert, Calendar y Pagination** mediante el CLI oficial.

## Estructura

```text
src/
├── app/
│   ├── dashboard/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ProjectForm.tsx
│   ├── TaskTable.tsx
│   ├── dashboard/
│   │   ├── DashboardProvider.tsx
│   │   ├── DashboardShell.tsx
│   │   ├── FormControls.tsx
│   │   ├── ConfirmDelete.tsx
│   │   ├── MemberForm.tsx
│   │   ├── TaskForm.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── OverviewSection.tsx
│   │   └── SettingsSection.tsx
│   └── ui/
└── lib/
    ├── dashboard/
    │   ├── model.ts
    │   ├── initial-data.ts
    │   └── operations.ts
    └── utils.ts
scripts/verify-webpack.mjs
tests/
├── dashboard.test.mjs
├── ui.test.mjs
└── test-loader.mjs
```

## Requisitos e instalación

Entorno utilizado: Node.js **24.21.0** y npm **11.19.0**. Se requiere acceso al registro npm para instalar dependencias y a Google Fonts durante la compilación de la plantilla.

El repositorio contiene directamente el proyecto, con `package.json` en la raíz:

```bash
git clone https://github.com/naomisanchez-coder/LAB11Web-Dashboard.git
cd LAB11Web-Dashboard
npm ci
```

No se necesitan variables de entorno ni credenciales.

## Ejecución local

Desde la raíz del proyecto:

```bash
npm run dev
```

Abrir [http://localhost:3000/dashboard](http://localhost:3000/dashboard). Para probar una compilación de producción previamente generada:

```bash
npm start
```

## Validación técnica

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
npm audit
```

Resultado de la revisión del 5 de noviembre de 2026:

- TypeScript: aprobado.
- ESLint: aprobado, sin advertencias.
- `npm test`: **22 pruebas aprobadas** sobre CRUD, relaciones, métricas, fechas, paginación, bloqueo de doble envío, cancelación, formularios y renderizado de las cinco secciones.
- Las pruebas de renderizado usan React y Radix; las de eventos de formularios usan estado controlado en memoria. No son pruebas visuales ni end-to-end de navegador.
- La compilación normal de Turbopack se intentó. El entorno restringió Google Fonts y, con acceso a la red, bloqueó un socket interno: `binding to a port: Operation not permitted`.
- La compilación alternativa con Webpack fue exitosa y generó `/dashboard`.
- El intento de servidor local fue bloqueado con `listen EPERM`. No se verificó la ruta por HTTP ni se generaron capturas.
- Se verificaron el HTML prerenderizado y las clases CSS del tema y los breakpoints responsive. La apariencia, el foco, la navegación de teclado y los tamaños reales de pantalla requieren revisión manual.

### Verificación alternativa con Webpack

```bash
npm run build:verify
```

Este comando aplica temporalmente el loader Tailwind ya instalado a `globals.css`, ejecuta Next.js con Webpack y restaura `next.config.ts` en `finally`, incluso si la compilación falla. No debe ejecutarse al mismo tiempo que otro proceso de desarrollo o compilación. No modifica el script normal `build` ni cambia permanentemente el compilador.

El bloqueo del entorno no demuestra un fallo de la aplicación, pero tampoco garantiza un despliegue: la compilación normal debe comprobarse en el entorno de destino.

### Dependencias

La auditoría completa reportó **13 vulnerabilidades: 2 bajas y 11 moderadas**, sin altas ni críticas. Afectan herramientas de desarrollo: `shadcn`, `@shadcn/registry`, `ts-morph`, `@ts-morph/common`, `deepmerge`, `minimatch`, `eslint-config-next`, `typescript-eslint` y paquetes `@typescript-eslint/*`.

`npm audit --omit=dev` reportó **0 vulnerabilidades** en las dependencias de producción en esta revisión. Esto describe el resultado de la auditoría, no una garantía de ausencia de fallos.

npm también advierte que ESLint 9 ya no tiene soporte. Las correcciones propuestas por la auditoría implican cambios mayores o retrocesos de versión; no se ejecutó `npm audit fix --force` ni se alteraron versiones indiscriminadamente. Conviene revisar estas herramientas antes de una publicación de producción.

## Pruebas manuales y evidencias

Pendientes para la revisión del estudiante:

1. Navegar por las cinco pestañas con ratón y teclado.
2. Crear proyectos con integrantes, comprobar detalles y cancelar/confirmar eliminaciones.
3. Crear, editar, activar/desactivar y eliminar integrantes; verificar las restricciones si tienen tareas.
4. Crear y editar tareas, cambiar proyecto/responsable, seleccionar fechas y eliminarlas.
5. Probar páginas anterior/siguiente y la eliminación del último registro de una página.
6. Guardar preferencias y comprobar densidad, tamaño de página y métricas.
7. Verificar mensajes Alert, Spinner durante el guardado y bloqueo de doble clic.
8. Revisar móvil, tablet y escritorio, desplazamiento de tabla y formulario, foco y lectura de etiquetas.
9. Recargar y comprobar que vuelven los datos iniciales.

Incorporar posteriormente las capturas de la aplicación, los enlaces de repositorio y despliegue y las cinco conclusiones del informe académico. Este repositorio no contiene capturas generadas ni afirma que esas pruebas visuales se hayan realizado.

## Preparación para Vercel

Cuando se autorice el despliegue:

1. Importar este repositorio y seleccionar la rama `main`.
2. Mantener la raíz del proyecto en la raíz del repositorio (`.`), donde está `package.json`.
3. Utilizar el preset Next.js, Node.js 24.x y el comando normal `npm run build`; conservar la salida predeterminada de Next.js.
4. Verificar que la instalación use `package-lock.json` y que Google Fonts sea accesible durante el build.
5. Revisar los logs de compilación y las advertencias de dependencias antes de publicar.
6. Comprobar `/dashboard` y recordar que el estado sigue siendo local y se reinicia al recargar.

No se ha realizado ningún despliegue ni creado recursos de pago. Referencias oficiales: [Next.js en Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) y [configuración de compilación](https://vercel.com/docs/builds/configure-a-build).

# Panadería San Vicente — App de Remitos

App web mobile-first para cargar remitos diarios y sincronizar automáticamente con Google Sheets.

## Cómo usar

### Opción A — Archivo local (sin internet)
1. Descargá `index.html`
2. Abrilo en Chrome o Safari desde el celular
3. Los datos se guardan en el navegador del dispositivo

### Opción B — Sincronización con Google Sheets (recomendado)

#### 1. Configurar Google Apps Script
1. Abrí tu Google Sheet
2. Ir a **Extensiones > Apps Script**
3. Borrá el código que aparece y pegá el contenido de `apps-script/Code.gs`
4. Guardá con Ctrl+S
5. Ir a **Implementar > Nueva implementación**
   - Tipo: **App web**
   - Ejecutar como: **Yo mismo**
   - Quién tiene acceso: **Cualquier persona**
6. Hacé clic en **Implementar**
7. Copiá la URL que aparece (empieza con `https://script.google.com/macros/s/...`)

#### 2. Pegar la URL en la app
1. Abrí `index.html` en el navegador
2. Ir a la pestaña **Config**
3. Pegá la URL en el campo "URL del Apps Script"
4. Listo — cada remito guardado se envía automáticamente al Sheet

## Características
- **Cargar**: elegí vendedor, fecha y cantidades por producto
- **Historial**: ver todos los remitos guardados, con filtro por vendedor
- **Resumen**: totales por mes o semana, desglose por vendedor
- **Config**: actualizar precios, nombres de vendedores, URL de Google Sheets, exportar CSV

## Vendedores configurados
- Javier
- Candela
- Nicolás

## Actualizar precios
Los precios se actualizan desde la pestaña **Config** → sección "Precios por producto".
Son fijos hasta que los cambies manualmente.

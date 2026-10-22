// Panadería San Vicente — Google Apps Script
// Pasos para configurar:
// 1. Abrí tu Google Sheet
// 2. Extensiones → Apps Script
// 3. Borrá todo y pegá este código
// 4. Guardá (Ctrl+S)
// 5. Implementar → Nueva implementación → App web
//    - Ejecutar como: Yo mismo
//    - Quién tiene acceso: Cualquier persona
// 6. Copiá la URL y pegala en la app (pestaña Config → URL del Apps Script)

var SPREADSHEET_ID = '1SdfAtqWB-vflhcUwd8VJ0QH4UVUpdU70ZM2SgvV1vTA';
var SHEET_NAME = 'Remitos'; // Nombre de la hoja donde se guardarán los datos

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Si la hoja no existe, crearla con encabezados
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Fecha', 'Día', 'Persona', 'Producto', 'Categoría', 'Tipo', 'Cantidad', 'Precio unitario', 'Subtotal', 'Total remito', 'ID remito']);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Agregar una fila por cada producto del remito
    if (data.rows && Array.isArray(data.rows)) {
      data.rows.forEach(function(row) {
        var fecha = new Date(row.fecha + 'T12:00:00');
        var dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        var dia = dias[fecha.getDay()];
        sheet.appendRow([
          row.fecha,
          dia,
          row.persona,
          row.producto,
          row.categoria,
          row.tipo,
          row.cantidad,
          row.precio_unit,
          row.subtotal,
          data.total,
          data.remito_id
        ]);
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Para probar manualmente desde el editor:
function testPost() {
  var testData = {
    remito_id: 'test123',
    fecha: '2025-10-21',
    persona: 'Javier',
    total: 15000,
    rows: [
      { fecha: '2025-10-21', persona: 'Javier', producto: 'Medialunas', categoria: 'Docena', tipo: 'docena', cantidad: 5, precio_unit: 2000, subtotal: 10000 },
      { fecha: '2025-10-21', persona: 'Javier', producto: 'Figacitas de manteca', categoria: 'Por kilo', tipo: 'kilo', cantidad: 2.5, precio_unit: 2000, subtotal: 5000 }
    ]
  };
  var e = { postData: { contents: JSON.stringify(testData) } };
  var result = doPost(e);
  Logger.log(result.getContent());
}

var SPREADSHEET_ID = '1SdfAtqWB-vflhcUwd8VJ0QH4UVUpdU70ZM2SgvV1vTA';
var SHEET_NAME = 'Remitos';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Fecha', 'Dia', 'Persona', 'Producto', 'Categoria', 'Tipo', 'Cantidad', 'Precio unitario', 'Subtotal', 'Total remito', 'ID remito']);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    if (data.rows && Array.isArray(data.rows)) {
      data.rows.forEach(function(row) {
        var fecha = new Date(row.fecha + 'T12:00:00');
        var dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
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

function testPost() {
  var testData = {
    remito_id: 'test123',
    fecha: '2025-10-22',
    persona: 'Javier',
    total: 15000,
    rows: [
      { fecha: '2025-10-22', persona: 'Javier', producto: 'Medialunas', categoria: 'Docena', tipo: 'docena', cantidad: 5, precio_unit: 2000, subtotal: 10000 },
      { fecha: '2025-10-22', persona: 'Javier', producto: 'Figacitas', categoria: 'Por kilo', tipo: 'kilo', cantidad: 2.5, precio_unit: 2000, subtotal: 5000 }
    ]
  };
  var e = { postData: { contents: JSON.stringify(testData) } };
  var result = doPost(e);
  Logger.log(result.getContent());
}

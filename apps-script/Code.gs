var SPREADSHEET_ID = '1SdfAtqWB-vflhcUwd8VJ0QH4UVUpdU70ZM2SgvV1vTA';
var SHEET_NAME = 'Remitos';

function processData(data) {
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
}

// GET: app sends data as ?d=<base64-encoded-json>
function doGet(e) {
  try {
    var encoded = e.parameter.d;
    if (!encoded) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'No data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var json = Utilities.newBlob(Utilities.base64Decode(encoded)).getDataAsString();
    var data = JSON.parse(json);
    processData(data);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POST: kept for compatibility
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    processData(data);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testGet() {
  var testData = {
    remito_id: 'test_get_001',
    fecha: '2026-11-03',
    persona: 'Javier',
    total: 15000,
    rows: [
      { fecha: '2026-11-03', persona: 'Javier', producto: 'Medialunas', categoria: 'Docena', tipo: 'docena', cantidad: 5, precio_unit: 2000, subtotal: 10000 },
      { fecha: '2026-11-03', persona: 'Javier', producto: 'Figacitas', categoria: 'Por kilo', tipo: 'kilo', cantidad: 2.5, precio_unit: 2000, subtotal: 5000 }
    ]
  };
  var encoded = Utilities.base64Encode(JSON.stringify(testData));
  var e = { parameter: { d: encoded } };
  var result = doGet(e);
  Logger.log(result.getContent());
}

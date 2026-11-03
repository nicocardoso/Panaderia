var SPREADSHEET_ID = '1SdfAtqWB-vflhcUwd8VJ0QH4UVUpdU70ZM2SgvV1vTA';
var RAW_SHEET = 'Remitos';
var YELLOW = '#FFC000';

function processData(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  writeRawData(ss, data);
  generateDailySheet(ss, data.fecha);
}

function writeRawData(ss, data) {
  var sheet = ss.getSheetByName(RAW_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(RAW_SHEET);
    sheet.appendRow(['Fecha','Dia','Persona','Producto','Categoria','Tipo','Cantidad','Precio unitario','Subtotal','Total remito','ID remito']);
    sheet.getRange(1,1,1,11).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  if (!data.rows) return;
  data.rows.forEach(function(row) {
    var d = new Date(row.fecha + 'T12:00:00');
    var dias = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
    sheet.appendRow([row.fecha, dias[d.getDay()], row.persona, row.producto,
      row.categoria, row.tipo, row.cantidad, row.precio_unit, row.subtotal, data.total, data.remito_id]);
  });
}

function generateDailySheet(ss, fecha) {
  var raw = ss.getSheetByName(RAW_SHEET);
  if (!raw) return;

  var rows = raw.getDataRange().getValues().slice(1)
    .filter(function(r) {
      var val = r[0];
      var dateStr = (val instanceof Date)
        ? Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : String(val);
      return dateStr === fecha;
    });
  if (!rows.length) return;

  // Aggregate by product
  var prods = {}, order = [];
  rows.forEach(function(r) {
    var nombre = String(r[3]), tipo = String(r[5]);
    var cantidad = Number(r[6]), subtotal = Number(r[8]);
    if (!prods[nombre]) { prods[nombre] = { tipo: tipo, cantidad: 0, subtotal: 0 }; order.push(nombre); }
    prods[nombre].cantidad += cantidad;
    prods[nombre].subtotal += subtotal;
  });

  var grandTotal = order.reduce(function(s, n) { return s + prods[n].subtotal; }, 0);

  // Date header text
  var d = new Date(fecha + 'T12:00:00');
  var diasNombre = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  var p = fecha.split('-');
  var fechaDisplay = p[2] + '/' + p[1] + '/' + p[0];

  // Sheet tab named like existing ones: "MARTES 03-11-2026"
  var sheetTitle = diasNombre[d.getDay()] + ' ' + p[2] + '-' + p[1] + '-' + p[0];
  var ds = ss.getSheetByName(sheetTitle);
  if (ds) { ds.clear(); ds.clearFormats(); } else { ds = ss.insertSheet(sheetTitle); }

  var r = 1;

  // ── Date header ──
  ds.getRange(r,1,1,6).merge()
    .setValue(diasNombre[d.getDay()] + ' ' + fechaDisplay)
    .setBackground(YELLOW).setFontWeight('bold').setFontSize(13)
    .setHorizontalAlignment('center')
    .setBorder(true,true,true,true,false,false);
  r += 2;

  // ── One section per product ──
  order.forEach(function(nombre) {
    var prod = prods[nombre];
    var isKilo = prod.tipo === 'kilo';
    var isDocena = prod.tipo === 'docena';

    // Product title
    ds.getRange(r,2,1,4).merge()
      .setValue(nombre.toUpperCase())
      .setBackground(YELLOW).setFontWeight('bold').setFontSize(11)
      .setHorizontalAlignment('center');
    r++;

    var sectionStart = r;

    if (isKilo) {
      // Header row
      ds.getRange(r,2).setValue('COLEGIOS');
      ds.getRange(r,3).setValue('UNIDADES');
      ds.getRange(r,4).setValue('KILOS');
      ds.getRange(r,5).setValue('PRECIO');
      ds.getRange(r,2,1,4).setFontWeight('bold').setHorizontalAlignment('center');
      r++;
      // Data row
      ds.getRange(r,4).setValue(Math.round(prod.cantidad * 100) / 100);
      ds.getRange(r,5).setValue(prod.subtotal).setNumberFormat('$#,##0.00');
      r++;
      // Total row
      ds.getRange(r,2).setValue('TOTAL').setFontWeight('bold');
      ds.getRange(r,4).setValue(Math.round(prod.cantidad * 100) / 100).setFontWeight('bold');
      ds.getRange(r,5).setValue(prod.subtotal).setFontWeight('bold').setNumberFormat('$#,##0.00');
    } else if (isDocena) {
      ds.getRange(r,3).setValue('DOCENAS');
      ds.getRange(r,5).setValue('PRECIO');
      ds.getRange(r,3,1,3).setFontWeight('bold').setHorizontalAlignment('center');
      r++;
      ds.getRange(r,3).setValue(prod.cantidad);
      ds.getRange(r,5).setValue(prod.subtotal).setNumberFormat('$#,##0.00');
      r++;
      ds.getRange(r,2).setValue('TOTAL').setFontWeight('bold');
      ds.getRange(r,3).setValue(prod.cantidad).setFontWeight('bold');
      ds.getRange(r,5).setValue(prod.subtotal).setFontWeight('bold').setNumberFormat('$#,##0.00');
    } else {
      ds.getRange(r,3).setValue('UNIDADES');
      ds.getRange(r,5).setValue('PRECIO');
      ds.getRange(r,3,1,3).setFontWeight('bold').setHorizontalAlignment('center');
      r++;
      ds.getRange(r,3).setValue(prod.cantidad);
      ds.getRange(r,5).setValue(prod.subtotal).setNumberFormat('$#,##0.00');
      r++;
      ds.getRange(r,2).setValue('TOTAL').setFontWeight('bold');
      ds.getRange(r,3).setValue(prod.cantidad).setFontWeight('bold');
      ds.getRange(r,5).setValue(prod.subtotal).setFontWeight('bold').setNumberFormat('$#,##0.00');
    }

    // Border around section (header+data+total)
    ds.getRange(sectionStart, 2, r - sectionStart + 1, 4)
      .setBorder(true,true,true,true,true,true);

    r += 2;
  });

  // ── Grand total ──
  ds.getRange(r,4,1,2).merge()
    .setValue('TOTAL  $' + grandTotal.toLocaleString('es-AR', {minimumFractionDigits: 1, maximumFractionDigits: 1}))
    .setBackground(YELLOW).setFontWeight('bold').setFontSize(12)
    .setHorizontalAlignment('center')
    .setBorder(true,true,true,true,false,false);

  // Column widths
  ds.setColumnWidth(1, 20);
  ds.setColumnWidth(2, 95);
  ds.setColumnWidth(3, 95);
  ds.setColumnWidth(4, 85);
  ds.setColumnWidth(5, 115);
}

function doGet(e) {
  try {
    var encoded = e.parameter.d;
    if (!encoded) return ContentService.createTextOutput(JSON.stringify({ok:false,error:'No data'})).setMimeType(ContentService.MimeType.JSON);
    var json = Utilities.newBlob(Utilities.base64Decode(encoded)).getDataAsString();
    processData(JSON.parse(json));
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    processData(JSON.parse(e.postData.contents));
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function testGenerate() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var raw = ss.getSheetByName(RAW_SHEET);
  if (!raw) { console.log('ERROR: No sheet named ' + RAW_SHEET); return; }

  var allRows = raw.getDataRange().getValues();
  console.log('Total rows incl header: ' + allRows.length);

  var fecha = '2026-11-03';
  var tz = Session.getScriptTimeZone();
  console.log('Script timezone: ' + tz);

  // Show first 5 data rows to see how dates are stored
  for (var i = 1; i <= Math.min(5, allRows.length - 1); i++) {
    var val = allRows[i][0];
    var isDate = val instanceof Date;
    var dateStr = isDate ? Utilities.formatDate(val, tz, 'yyyy-MM-dd') : String(val);
    console.log('Row ' + i + ': val=' + val + ' | isDate=' + isDate + ' | dateStr=' + dateStr + ' | match=' + (dateStr === fecha));
  }

  generateDailySheet(ss, fecha);
  console.log('Done');
}

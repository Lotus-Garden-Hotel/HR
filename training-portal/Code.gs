// ============================================================
// SISTEM FOTO TRAINING - LOTUS GARDEN HOTEL
// By Waringin Hospitality | GAS Backend v3.1 PWA
// Folder Drive ID: 1W9N3_m5643SPFklC1w07bWZPIGJif5et
// Support: GET (query params) + POST (JSON body) → CORS JSON
// ============================================================

const ID_FOLDER_INDUK = "1W9N3_m5643SPFklC1w07bWZPIGJif5et";

const DEPARTMENTS = [
  "Front Office","Housekeeping","F&B Product",
  "Engineering","Accounting","Human Resources"
];

const NAMA_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

// ── Helpers ──────────────────────────────────────────────
function getNamaFolderBulan(date) {
  const d = date || new Date();
  return NAMA_BULAN[d.getMonth()] + " " + d.getFullYear();
}

function getOrCreateFolder(parent, name) {
  const iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}

function parseBulanSort(s) {
  const p = s.split(' ');
  return p.length < 2 ? 0 : parseInt(p[1]) * 100 + NAMA_BULAN.indexOf(p[0]);
}

// ── CORS JSON Response ────────────────────────────────────
function jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doGet: serve HTML (no action) atau API via GET params ─
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  // Tidak ada action → serve HTML (GAS Web App mode internal)
  if (!action) {
    try {
      return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle('Training Portal - Lotus Garden')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport','width=device-width,initial-scale=1.0');
    } catch(err) {
      return jsonOut({ success:false, error:'Index.html not found: '+err.message });
    }
  }

  // API mode → proses action
  try {
    const p = e.parameter;
    switch(action) {
      case 'getFolderStructure':    return jsonOut(getFolderStructure());
      case 'getRecentUploads':      return jsonOut(getRecentUploads());
      case 'getBulanAktif':         return jsonOut({ success:true, bulanAktif:getNamaFolderBulan() });
      case 'getUserInfo':           return jsonOut(getUserInfo());
      case 'getFolderPhotos':       return jsonOut(getFolderPhotos(p.folderId));
      case 'searchPhotos':          return jsonOut(searchPhotos(p.query || ''));
      case 'getBulanFoldersForDept':return jsonOut(getBulanFoldersForDept(p.deptName));
      default: return jsonOut({ success:false, error:'Unknown action: '+action });
    }
  } catch(err) {
    return jsonOut({ success:false, error:err.message });
  }
}

// ── doPost: upload, delete, init via JSON body ─────────────
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch(err) {
    return jsonOut({ success:false, error:'Invalid JSON: '+err.message });
  }

  try {
    const action = body.action;
    switch(action) {
      case 'uploadPhoto':              return jsonOut(uploadPhoto(body));
      case 'deletePhoto':              return jsonOut(deletePhoto(body.fileId));
      case 'initializeFolderStructure':return jsonOut(initializeFolderStructure());
      case 'createSubKegiatanFolder':  return jsonOut(createSubKegiatanFolder(body.deptName, body.bulanName, body.subKegiatanName));
      default: return jsonOut({ success:false, error:'Unknown action: '+action });
    }
  } catch(err) {
    return jsonOut({ success:false, error:err.message });
  }
}

// ── INISIALISASI FOLDER ───────────────────────────────────
function initializeFolderStructure() {
  try {
    const root = DriveApp.getFolderById(ID_FOLDER_INDUK);
    const result = { created:[], existing:[] };
    DEPARTMENTS.forEach(dept => {
      const iter = root.getFoldersByName(dept);
      if (iter.hasNext()) result.existing.push(dept);
      else { root.createFolder(dept); result.created.push(dept); }
    });
    return { success:true, result };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── GET FOLDER STRUCTURE ─────────────────────────────────
function getFolderStructure() {
  try {
    const root = DriveApp.getFolderById(ID_FOLDER_INDUK);
    const structure = [];

    DEPARTMENTS.forEach(dept => {
      const di = root.getFoldersByName(dept);
      if (!di.hasNext()) return;
      const deptFolder = di.next();
      const deptData = { name:dept, folderId:deptFolder.getId(), bulanFolders:[], totalPhotos:0 };

      const bi = deptFolder.getFolders();
      while (bi.hasNext()) {
        const bf = bi.next();
        const bulanData = { name:bf.getName(), folderId:bf.getId(), subKegiatan:[], fotoLangsung:0, totalPhotos:0 };

        // Hitung foto langsung di folder bulan
        const fi = bf.getFiles();
        while (fi.hasNext()) {
          if (fi.next().getMimeType().startsWith('image/')) bulanData.fotoLangsung++;
        }
        bulanData.totalPhotos += bulanData.fotoLangsung;

        // Sub-kegiatan
        const si = bf.getFolders();
        while (si.hasNext()) {
          const sf = si.next();
          let cnt = 0;
          const sfi = sf.getFiles();
          while (sfi.hasNext()) { if (sfi.next().getMimeType().startsWith('image/')) cnt++; }
          bulanData.subKegiatan.push({ name:sf.getName(), folderId:sf.getId(), photoCount:cnt });
          bulanData.totalPhotos += cnt;
        }

        deptData.bulanFolders.push(bulanData);
        deptData.totalPhotos += bulanData.totalPhotos;
      }

      deptData.bulanFolders.sort((a,b) => parseBulanSort(b.name) - parseBulanSort(a.name));
      structure.push(deptData);
    });

    return { success:true, structure };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── GET BULAN FOLDERS FOR DEPT ───────────────────────────
function getBulanFoldersForDept(deptName) {
  try {
    const root = DriveApp.getFolderById(ID_FOLDER_INDUK);
    const di = root.getFoldersByName(deptName);
    if (!di.hasNext()) return { success:false, error:'Dept tidak ditemukan: '+deptName };

    const deptFolder = di.next();
    const bulanList  = [];
    const bi = deptFolder.getFolders();
    while (bi.hasNext()) {
      const bf = bi.next();
      const subList = [];
      const si = bf.getFolders();
      while (si.hasNext()) subList.push(si.next().getName());
      bulanList.push({ name:bf.getName(), folderId:bf.getId(), subKegiatan:subList });
    }
    bulanList.sort((a,b) => parseBulanSort(b.name) - parseBulanSort(a.name));
    return { success:true, bulanList, bulanAktif:getNamaFolderBulan() };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── UPLOAD FOTO ──────────────────────────────────────────
function uploadPhoto(data) {
  try {
    const root = DriveApp.getFolderById(ID_FOLDER_INDUK);

    // 1. Folder dept
    const di = root.getFoldersByName(data.dept);
    if (!di.hasNext()) return { success:false, error:"Folder dept '"+data.dept+"' tidak ditemukan. Jalankan inisialisasi." };
    const deptFolder = di.next();

    // 2. Folder bulan (otomatis)
    const namaBulan = (data.bulan && data.bulan.trim()) ? data.bulan.trim() : getNamaFolderBulan();
    const bulanFolder = getOrCreateFolder(deptFolder, namaBulan);

    // 3. Sub-kegiatan (opsional)
    let targetFolder = bulanFolder;
    const subKegiatan = (data.subKegiatan || '').trim();
    if (subKegiatan) targetFolder = getOrCreateFolder(bulanFolder, subKegiatan);

    // 4. Decode base64 & simpan
    const base64Data = data.base64.split(',')[1];
    const mimeType   = data.base64.split(';')[0].split(':')[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, data.filename);
    const file = targetFolder.createFile(blob);

    // 5. Set deskripsi metadata
    const now     = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
    const pathStr = data.dept+' › '+namaBulan+(subKegiatan?' › '+subKegiatan:'');
    file.setDescription('DATE: '+dateStr+' | PATH: '+pathStr+' | LOC: '+(data.location||'Lotus Garden Hotel')+' | NOTES: '+(data.notes||'-'));

    // 6. Log ke Sheets
    logToSheet(file.getId(), file.getName(), data.dept, namaBulan, subKegiatan||'-', data.location, data.notes, dateStr);

    return {
      success:true,
      fileId:file.getId(),
      fileName:file.getName(),
      namaBulan, subKegiatan,
      viewUrl:'https://drive.google.com/file/d/'+file.getId()+'/view',
      message:'Foto berhasil diupload ke '+pathStr
    };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── GET FOLDER PHOTOS ────────────────────────────────────
function getFolderPhotos(folderId) {
  try {
    if (!folderId) return { success:false, error:'folderId diperlukan' };
    const folder = DriveApp.getFolderById(folderId);
    const photos  = [];
    const fi = folder.getFiles();
    while (fi.hasNext()) {
      const f = fi.next();
      if (!f.getMimeType().startsWith('image/')) continue;
      photos.push({
        id:f.getId(), name:f.getName(),
        date:f.getDateCreated().toISOString(),
        description:f.getDescription()||'',
        thumbnailUrl:'https://drive.google.com/thumbnail?id='+f.getId()+'&sz=w300'
      });
    }
    photos.sort((a,b) => new Date(b.date)-new Date(a.date));
    return { success:true, photos, folderName:folder.getName() };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── GET RECENT UPLOADS ───────────────────────────────────
function getRecentUploads() {
  try {
    const root = DriveApp.getFolderById(ID_FOLDER_INDUK);
    const all  = [];

    DEPARTMENTS.forEach(dept => {
      const di = root.getFoldersByName(dept);
      if (!di.hasNext()) return;
      const deptFolder = di.next();

      function scan(folder, bulan, sub) {
        const fi = folder.getFiles();
        while (fi.hasNext()) {
          const f = fi.next();
          if (!f.getMimeType().startsWith('image/')) continue;
          all.push({
            id:f.getId(), dept, bulan, subKegiatan:sub,
            date:f.getDateCreated().toISOString(),
            thumbnailUrl:'https://drive.google.com/thumbnail?id='+f.getId()+'&sz=w200'
          });
        }
      }

      const bi = deptFolder.getFolders();
      while (bi.hasNext()) {
        const bf = bi.next();
        scan(bf, bf.getName(), '');
        const si = bf.getFolders();
        while (si.hasNext()) { const sf=si.next(); scan(sf, bf.getName(), sf.getName()); }
      }
    });

    all.sort((a,b) => new Date(b.date)-new Date(a.date));
    return { success:true, files:all.slice(0,10) };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── SEARCH PHOTOS ────────────────────────────────────────
function searchPhotos(query) {
  try {
    if (!query || !query.trim()) return { success:true, results:[] };
    const root = DriveApp.getFolderById(ID_FOLDER_INDUK);
    const results = [];
    const q = query.toLowerCase();

    DEPARTMENTS.forEach(dept => {
      const di = root.getFoldersByName(dept);
      if (!di.hasNext()) return;
      const deptFolder = di.next();

      function scan(folder, bulan, sub) {
        const fi = folder.getFiles();
        while (fi.hasNext()) {
          const f = fi.next();
          if (!f.getMimeType().startsWith('image/')) continue;
          const desc = (f.getDescription()||'').toLowerCase();
          if (dept.toLowerCase().includes(q)||bulan.toLowerCase().includes(q)||
              sub.toLowerCase().includes(q)||desc.includes(q)||f.getName().toLowerCase().includes(q)) {
            results.push({
              id:f.getId(), dept, bulan, subKegiatan:sub,
              description:f.getDescription()||'',
              date:f.getDateCreated().toISOString(),
              thumbnailUrl:'https://drive.google.com/thumbnail?id='+f.getId()+'&sz=w200'
            });
          }
        }
      }

      const bi = deptFolder.getFolders();
      while (bi.hasNext()) {
        const bf = bi.next();
        scan(bf, bf.getName(), '');
        const si = bf.getFolders();
        while (si.hasNext()) { const sf=si.next(); scan(sf, bf.getName(), sf.getName()); }
      }
    });

    results.sort((a,b) => new Date(b.date)-new Date(a.date));
    return { success:true, results:results.slice(0,50) };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── DELETE FOTO ──────────────────────────────────────────
function deletePhoto(fileId) {
  try {
    if (!fileId) return { success:false, error:'fileId diperlukan' };
    DriveApp.getFileById(fileId).setTrashed(true);
    return { success:true };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── CREATE SUB-KEGIATAN FOLDER ───────────────────────────
function createSubKegiatanFolder(deptName, bulanName, subKegiatanName) {
  try {
    const root = DriveApp.getFolderById(ID_FOLDER_INDUK);
    const di = root.getFoldersByName(deptName);
    if (!di.hasNext()) return { success:false, error:'Dept tidak ditemukan' };
    const bulanFolder = getOrCreateFolder(di.next(), bulanName || getNamaFolderBulan());
    const sub = getOrCreateFolder(bulanFolder, subKegiatanName.trim());
    return { success:true, folderId:sub.getId(), name:sub.getName() };
  } catch(e) { return { success:false, error:e.message }; }
}

// ── LOG KE GOOGLE SHEETS ─────────────────────────────────
function logToSheet(fileId, fileName, dept, bulan, sub, location, notes, dateStr) {
  try {
    const root    = DriveApp.getFolderById(ID_FOLDER_INDUK);
    const logName = "📋 Log Upload Foto Training";
    let sheet;
    const fi = root.getFilesByName(logName);
    if (fi.hasNext()) {
      sheet = SpreadsheetApp.open(fi.next()).getActiveSheet();
    } else {
      const ss = SpreadsheetApp.create(logName);
      DriveApp.getFileById(ss.getId()).moveTo(root);
      sheet = ss.getActiveSheet();
      sheet.appendRow(['Tanggal','Departemen','Bulan','Sub Kegiatan','Nama File','Lokasi','Catatan','Link Drive']);
      sheet.getRange(1,1,1,8).setFontWeight('bold').setBackground('#1a5c2a').setFontColor('white');
    }
    sheet.appendRow([
      dateStr, dept, bulan, sub||'-', fileName,
      location||'Lotus Garden Hotel', notes||'-',
      'https://drive.google.com/file/d/'+fileId+'/view'
    ]);
  } catch(e) { console.log('Log error:', e.message); }
}

// ── GET USER INFO ────────────────────────────────────────
function getUserInfo() {
  try {
    const u = Session.getActiveUser();
    const email = u.getEmail();
    return { success:true, email, name:email.split('@')[0] };
  } catch(e) { return { success:false, error:e.message }; }
}

function getBulanAktif() {
  return { success:true, bulanAktif:getNamaFolderBulan() };
}

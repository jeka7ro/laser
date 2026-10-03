// Amelia WordPress CSV Importer & Belgian Phone Normalizer
// Specifically crafted for Laser Magic (Vilvoorde / Brussels)
// Handles native Amelia Customer CSV exports (EN, FR, NL)

/**
 * Normalizes Belgian phone numbers to standard international format: +32 4XX XX XX XX
 */
export function normalizeBelgianPhone(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  const hasPlus = str.startsWith('+');
  let digits = str.replace(/\D/g, '');

  if (digits.startsWith('0032')) {
    digits = '32' + digits.substring(4);
  } else if (digits.startsWith('32')) {
    // already starts with 32
  } else if (digits.startsWith('0')) {
    digits = '32' + digits.substring(1);
  } else if (!hasPlus && (digits.startsWith('4') || digits.startsWith('2') || digits.startsWith('3') || digits.startsWith('9'))) {
    digits = '32' + digits;
  }

  if (digits.startsWith('32')) {
    const after = digits.substring(2);
    // Belgian mobile: 32 + 4XX XX XX XX (9 digits after 32)
    if (after.startsWith('4') && after.length === 9) {
      return `+32 ${after.substring(0, 3)} ${after.substring(3, 5)} ${after.substring(5, 7)} ${after.substring(7, 9)}`;
    }
    // Brussels landlines: 32 + 2 XXX XX XX (8 digits after 32)
    if (after.startsWith('2') && after.length === 8) {
      return `+32 2 ${after.substring(1, 4)} ${after.substring(4, 6)} ${after.substring(6, 8)}`;
    }
    // Antwerp/Liege/Gent landlines: 32 + 3/4/9 XXX XX XX
    if (after.length === 8) {
      return `+32 ${after.substring(0, 2)} ${after.substring(2, 4)} ${after.substring(4, 6)} ${after.substring(6, 8)}`;
    }
    return `+32 ${after}`;
  }

  return hasPlus ? `+${digits}` : (digits.length >= 7 ? `+${digits}` : str);
}

/**
 * Robust CSV parser that handles quotes, line breaks, and auto-detects delimiter (, ; \t)
 */
export function parseCSVRaw(csvText) {
  let text = (csvText || '').replace(/^\uFEFF/, '').trim();
  if (!text) return [];

  // Auto-detect delimiter from the first line
  const firstLine = text.split('\n')[0];
  const countComma = (firstLine.match(/,/g) || []).length;
  const countSemi = (firstLine.match(/;/g) || []).length;
  const countTab = (firstLine.match(/\t/g) || []).length;

  let delimiter = ',';
  if (countSemi > countComma && countSemi >= countTab) delimiter = ';';
  else if (countTab > countComma && countTab >= countSemi) delimiter = '\t';

  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some(val => val.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(val => val.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header keys to standard tokens
 */
function normalizeHeaderName(headerStr) {
  const clean = (headerStr || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  if (/^(id|customerid|externalid|clientid)$/.test(clean)) return 'id';
  if (/^(firstname|prenom|voornaam|first)$/.test(clean)) return 'firstName';
  if (/^(lastname|nom|achternaam|famille|last|surname)$/.test(clean)) return 'lastName';
  if (/^(name|fullname|nomcomplet|customername|client|klant)$/.test(clean)) return 'fullName';
  if (/^(email|mail|courriel|emailaddress|adressee?mail)$/.test(clean)) return 'email';
  if (/^(phone|telephone|telefoon|tel|gsm|mobile|portable|phonenumber)$/.test(clean)) return 'phone';
  if (/^(birthday|birthdate|datedenaissance|geboortedatum|dob|naissance)$/.test(clean)) return 'birthday';
  if (/^(note|notes|remarque|remarques|notitie|notities|opmerkingen|specialnotes|allergies|commentaire)$/.test(clean)) return 'notes';
  if (/^(company|companyname|entreprise|societe|bedrijf|organisation)$/.test(clean)) return 'company';
  if (/^(vat|vatnumber|tva|numtva|btw|btwnummer|taxnumber)$/.test(clean)) return 'vat';
  if (/^(bookings|totalbookings|reservations|boekingen|nbreservations|countbookings)$/.test(clean)) return 'bookingsCount';
  if (/^(totalspent|spent|depenses|ca|total|montanttotal|totaal)$/.test(clean)) return 'totalSpent';
  if (/^(lang|language|langue|taal)$/.test(clean)) return 'lang';
  if (/^(address|adresse|adres|billingaddress|street)$/.test(clean)) return 'address';

  return clean;
}

/**
 * Extracts child information from birthday or notes text
 */
function extractChildFromData(birthdayStr, notesStr) {
  const children = [];
  let childDob = null;
  let childAge = null;
  let childName = null;

  if (birthdayStr && birthdayStr.length >= 4) {
    const parsedDate = new Date(birthdayStr);
    if (!isNaN(parsedDate.getTime())) {
      childDob = parsedDate.toISOString().split('T')[0];
      const birthYear = parsedDate.getFullYear();
      childAge = Math.max(1, 2026 - birthYear);
    }
  }

  if (notesStr) {
    // Check patterns like "Enfant: Lucas (10 ans)" or "Anniversaire de Chloé"
    const matchAnniv = notesStr.match(/(?:anniversaire|enfant|pour|kind)\s+(?:de\s+)?([A-ZÀ-ÿa-z\-]+)(?:\s*\((\d+)\s*(?:ans|jaar|years?)\))?/i);
    if (matchAnniv) {
      childName = matchAnniv[1].charAt(0).toUpperCase() + matchAnniv[1].slice(1);
      if (matchAnniv[2]) childAge = parseInt(matchAnniv[2], 10);
    }
  }

  if (childName || childDob) {
    children.push({
      name: childName || 'Enfant',
      dob: childDob,
      age: childAge || 10
    });
  }

  return children;
}

/**
 * Main Amelia CSV parser
 * Converts raw CSV string into clean client objects matching Laser Magic CRM schema
 */
export function parseAmeliaCSV(csvContent, options = {}) {
  const {
    normalizePhone = true,
    detectChildren = true,
    defaultLang = 'fr'
  } = options;

  const rawRows = parseCSVRaw(csvContent);
  if (rawRows.length < 2) return { success: false, error: 'Le fichier CSV est vide ou ne contient aucun en-tête valide.', clients: [] };

  const headerRow = rawRows[0];
  const colMap = {};
  headerRow.forEach((col, idx) => {
    const key = normalizeHeaderName(col);
    colMap[key] = idx;
  });

  const parsedClients = [];
  const errors = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (row.length === 0 || row.every(val => !val.trim())) continue;

    const getVal = (key) => (colMap[key] !== undefined && row[colMap[key]]) ? row[colMap[key]].trim() : '';

    let customerName = getVal('fullName');
    const firstName = getVal('firstName');
    const lastName = getVal('lastName');

    if (!customerName) {
      if (firstName && lastName) customerName = `${firstName} ${lastName}`;
      else if (firstName) customerName = firstName;
      else if (lastName) customerName = lastName;
    }

    const email = getVal('email').toLowerCase();
    const rawPhone = getVal('phone');
    const phone = normalizePhone ? normalizeBelgianPhone(rawPhone) : rawPhone;
    const notes = getVal('notes');
    const company = getVal('company');
    const vat = getVal('vat');
    const birthday = getVal('birthday');
    const address = getVal('address');
    const rawBookingsCount = parseInt(getVal('bookingsCount'), 10);
    const bookingsCount = isNaN(rawBookingsCount) ? 1 : Math.max(1, rawBookingsCount);
    const rawTotalSpent = parseFloat(getVal('totalSpent').replace(/[^0-9.,]/g, '').replace(',', '.'));
    const totalSpent = isNaN(rawTotalSpent) ? 0 : rawTotalSpent;

    let lang = (getVal('lang') || defaultLang).toLowerCase();
    if (lang.includes('nl') || lang.includes('dutch') || lang.includes('neer')) lang = 'nl';
    else if (lang.includes('en') || lang.includes('ang')) lang = 'en';
    else lang = 'fr';

    // Must have at least a name, email or phone
    if (!customerName && !email && !phone) {
      errors.push(`Ligne ${r + 1} ignorée (aucun nom, e-mail ou téléphone)`);
      continue;
    }

    const isCorporate = !!(company || vat);
    const children = detectChildren ? extractChildFromData(birthday, notes) : [];

    const clientKey = (phone || '').replace(/[^0-9]/g, '') || email || customerName.toLowerCase().replace(/\s+/g, '_');
    const id = getVal('id') ? `cli_am_${getVal('id')}` : `cli_am_${r}_${clientKey.substring(0, 8)}`;

    parsedClients.push({
      id,
      customerName: customerName || 'Client Sans Nom',
      phone,
      originalPhone: rawPhone,
      email,
      lang,
      isCorporate,
      companyName: company,
      vatNumber: vat,
      billingAddress: address,
      bookingsCount,
      totalSpent,
      notes,
      children,
      source: 'amelia'
    });
  }

  return {
    success: true,
    totalRows: rawRows.length - 1,
    clients: parsedClients,
    errors
  };
}

/**
 * Sample Amelia CSV generator matching standard WordPress Amelia export
 */
export function generateAmeliaSampleCSV() {
  const headers = [
    'Id',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Birth Date',
    'Note',
    'Company',
    'Total Bookings',
    'Total Spent'
  ];

  const sampleData = [
    ['101', 'Sophie', 'Vermeulen', 'sophie.vermeulen@telenet.be', '0475123456', '2016-04-18', 'Anniversaire Lucas (10 ans). Gâteau chocolat demandé.', '', '3', '780.00'],
    ['102', 'Benoît', 'Dubois', 'b.dubois@skynet.be', '0484987654', '2017-09-03', 'Enfant: Camille (9 ans) · Sans arachides', '', '2', '520.00'],
    ['103', 'Marc', 'Vanderstraeten', 'marc@proximus-events.be', '022532222', '', 'Team building entreprise 20 collaborateurs', 'Proximus Events SA', '4', '1850.00'],
    ['104', 'Anke', 'Van Den Bossche', 'anke.vdb@gmail.com', '0495123456', '2015-11-20', 'Verjaardag Lars (11 jaar). Tafel 2.', '', '1', '286.00'],
    ['105', 'Patrick', 'Janssens', 'patrick@delhaize-logistics.be', '0478334455', '', 'Événement fin d\'année personnel BE0456789123', 'Delhaize Logistics', '2', '1240.00'],
    ['106', 'Laurent', 'Lambert', 'laurent.lambert@hotmail.com', '+32 470 66 77 88', '2018-02-14', 'Anniversaire Maxime (8 ans)', '', '1', '240.00'],
    ['107', 'Sarah', 'Claes', 'sarah.claes@outlook.be', '0471 22 33 44', '2014-06-30', 'Anniversaire Elena (12 ans) - Option Karaoké Fluo', '', '2', '490.00']
  ];

  const csvRows = [headers.join(','), ...sampleData.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))];
  return '\uFEFF' + csvRows.join('\n');
}

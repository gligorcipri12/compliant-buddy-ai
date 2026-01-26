import jsPDF from "jspdf";
import type { CompanyData } from "./documentTemplates";

// Helper to format date
const formatDate = (date?: string): string => {
  if (!date) return new Date().toLocaleDateString("ro-RO");
  return new Date(date).toLocaleDateString("ro-RO");
};

// Helper to add header to PDF
const addHeader = (doc: jsPDF, title: string, companyData: CompanyData) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Company header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(companyData.companyName || "Denumire Firmă", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`CUI: ${companyData.cui || "—"}`, pageWidth / 2, 27, { align: "center" });
  doc.text(`Adresa: ${companyData.address || "—"}`, pageWidth / 2, 33, { align: "center" });
  
  // Document title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), pageWidth / 2, 50, { align: "center" });
  
  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, 55, pageWidth - 20, 55);
  
  return 65; // Return Y position after header
};

// Helper to add footer
const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Pagina ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  doc.text(`Generat cu ComplianceBot - ${formatDate()}`, pageWidth / 2, pageHeight - 15, { align: "center" });
};

// Helper to add paragraph with word wrap
const addParagraph = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * 6);
};

// GDPR Privacy Policy
export const generatePrivacyPolicy = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Politica de Confidențialitate", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const content = [
    {
      title: "1. INTRODUCERE",
      text: `${companyData.companyName} (denumită în continuare „Operatorul"), cu sediul în ${companyData.address}, CUI ${companyData.cui}, se angajează să protejeze confidențialitatea datelor dumneavoastră personale în conformitate cu Regulamentul (UE) 2016/679 (GDPR).`
    },
    {
      title: "2. DATE COLECTATE",
      text: `Colectăm următoarele categorii de date personale: ${extraData.dataTypes || "nume, prenume, adresă de email, număr de telefon, adresă poștală"}.`
    },
    {
      title: "3. SCOPUL PRELUCRĂRII",
      text: `Datele personale sunt prelucrate în următoarele scopuri: ${extraData.dataProcessingPurpose || "furnizarea serviciilor, comunicări comerciale, îmbunătățirea serviciilor, conformare legală"}.`
    },
    {
      title: "4. BAZA LEGALĂ",
      text: "Prelucrarea datelor se efectuează în baza: consimțământului dumneavoastră, executării unui contract, obligațiilor legale ale operatorului, sau intereselor legitime ale operatorului."
    },
    {
      title: "5. PERIOADA DE PĂSTRARE",
      text: "Datele personale vor fi păstrate pe perioada necesară îndeplinirii scopurilor pentru care au fost colectate, dar nu mai mult de 5 ani de la ultima interacțiune."
    },
    {
      title: "6. DREPTURILE DUMNEAVOASTRĂ",
      text: "Aveți dreptul de: acces la datele personale, rectificare, ștergere (dreptul de a fi uitat), restricționarea prelucrării, portabilitatea datelor, opoziție la prelucrare, retragerea consimțământului."
    },
    {
      title: "7. CONTACT",
      text: `Pentru exercitarea drepturilor sau orice întrebări, ne puteți contacta la: ${companyData.email || "[email]"} sau la adresa: ${companyData.address}.`
    }
  ];
  
  content.forEach(section => {
    if (y > 260) {
      addFooter(doc, doc.getNumberOfPages());
      doc.addPage();
      y = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(section.title, 20, y);
    y += 7;
    
    doc.setFont("helvetica", "normal");
    y = addParagraph(doc, section.text, 20, y, 170);
    y += 8;
  });
  
  // Signature section
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Data intrării în vigoare: " + formatDate(), 20, y);
  y += 15;
  doc.text("Reprezentant legal,", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(companyData.representative || "_________________", 20, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// GDPR Data Processing Registry
export const generateDataRegistry = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Registrul Activităților de Prelucrare", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Table header
  doc.setFont("helvetica", "bold");
  doc.text("Nr.", 20, y);
  doc.text("Categorie date", 35, y);
  doc.text("Scop prelucrare", 90, y);
  doc.text("Termen păstrare", 150, y);
  y += 5;
  doc.line(20, y, 190, y);
  y += 7;
  
  doc.setFont("helvetica", "normal");
  
  const categories = (extraData.dataCategories || "Date identificare, Date contact, Date contractuale").split(",");
  categories.forEach((cat, index) => {
    doc.text(`${index + 1}.`, 20, y);
    doc.text(cat.trim(), 35, y);
    doc.text("Executare contract", 90, y);
    doc.text(extraData.retentionPeriod || "5 ani", 150, y);
    y += 8;
  });
  
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.text("Măsuri de securitate implementate:", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  const measures = [
    "- Acces restricționat la datele personale",
    "- Criptare date sensibile",
    "- Backup periodic",
    "- Instruire personal privind GDPR"
  ];
  measures.forEach(m => {
    doc.text(m, 25, y);
    y += 6;
  });
  
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text(`Data întocmirii: ${formatDate()}`, 20, y);
  y += 15;
  doc.text("Întocmit de,", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(companyData.representative || "_________________", 20, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Data Processing Agreement
export const generateDataProcessingAgreement = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Contract de Prelucrare a Datelor cu Caracter Personal", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  y = addParagraph(doc, `Încheiat astăzi, ${formatDate()}, între:`, 20, y, 170);
  y += 8;
  
  doc.setFont("helvetica", "bold");
  doc.text("OPERATOR:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${companyData.companyName}, cu sediul în ${companyData.address}, CUI ${companyData.cui}, reprezentată prin ${companyData.representative || "[Reprezentant]"}`, 20, y, 170);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.text("ÎMPUTERNICIT:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${extraData.processorName || "[Nume împuternicit]"}, cu sediul în ${extraData.processorAddress || "[Adresă]"}, CUI ${extraData.processorCui || "[CUI]"}`, 20, y, 170);
  y += 12;
  
  const clauses = [
    {
      title: "Art. 1 - OBIECTUL CONTRACTULUI",
      text: `Împuternicitul va prelucra, în numele Operatorului, următoarele categorii de date: ${extraData.dataTypes || "date personale ale clienților și angajaților"}.`
    },
    {
      title: "Art. 2 - OBLIGAȚIILE ÎMPUTERNICITULUI",
      text: "Împuternicitul se obligă să: prelucreze datele doar conform instrucțiunilor Operatorului; asigure confidențialitatea; implementeze măsuri de securitate adecvate; notifice incidentele de securitate în 24 ore."
    },
    {
      title: "Art. 3 - DURATA",
      text: "Prezentul contract este valabil pe durata relației contractuale dintre părți."
    },
    {
      title: "Art. 4 - ÎNCETARE",
      text: "La încetarea contractului, Împuternicitul va returna sau șterge toate datele personale, la alegerea Operatorului."
    }
  ];
  
  clauses.forEach(clause => {
    if (y > 250) {
      addFooter(doc, doc.getNumberOfPages());
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(clause.title, 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = addParagraph(doc, clause.text, 20, y, 170);
    y += 10;
  });
  
  // Signatures
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("OPERATOR,", 30, y);
  doc.text("ÎMPUTERNICIT,", 130, y);
  y += 15;
  doc.setFont("helvetica", "normal");
  doc.text(companyData.representative || "_________________", 30, y);
  doc.text(extraData.processorName || "_________________", 130, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Employee GDPR Consent
export const generateEmployeeGDPRConsent = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Acord de Prelucrare a Datelor Personale - Angajat", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  y = addParagraph(doc, `Subsemnatul/a ${extraData.employeeName || "[Nume Angajat]"}, CNP ${extraData.employeeCNP || "[CNP]"}, angajat/ă al ${companyData.companyName}, declar că:`, 20, y, 170);
  y += 12;
  
  const declarations = [
    "1. Am fost informat/ă despre prelucrarea datelor mele personale de către angajator în scopul executării contractului de muncă, îndeplinirii obligațiilor legale și intereselor legitime ale angajatorului.",
    "2. Am luat cunoștință despre categoriile de date prelucrate: date de identificare, date de contact, date profesionale, date financiare.",
    "3. Am fost informat/ă despre drepturile mele conform GDPR: dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție.",
    "4. Înțeleg că pot retrage consimțământul în orice moment, fără a afecta legalitatea prelucrării anterioare.",
    "5. Am primit o copie a Politicii de Confidențialitate a angajatorului."
  ];
  
  declarations.forEach(decl => {
    if (y > 250) {
      addFooter(doc, doc.getNumberOfPages());
      doc.addPage();
      y = 20;
    }
    y = addParagraph(doc, decl, 20, y, 170);
    y += 8;
  });
  
  y += 15;
  doc.text(`Data: ${formatDate()}`, 20, y);
  y += 20;
  
  doc.setFont("helvetica", "bold");
  doc.text("Semnătura angajat:", 20, y);
  doc.text("Semnătura angajator:", 110, y);
  y += 15;
  doc.line(20, y, 80, y);
  doc.line(110, y, 170, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Full-time Employment Contract
export const generateFullTimeContract = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Contract Individual de Muncă", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  y = addParagraph(doc, `Încheiat astăzi, ${formatDate(extraData.startDate)}, între:`, 20, y, 170);
  y += 8;
  
  doc.setFont("helvetica", "bold");
  doc.text("ANGAJATOR:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${companyData.companyName}, cu sediul în ${companyData.address}, CUI ${companyData.cui}, reprezentată prin ${companyData.representative || "[Reprezentant]"}, în calitate de administrator`, 20, y, 170);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.text("ANGAJAT:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${extraData.employeeName || "[Nume]"}, CNP ${extraData.employeeCNP || "[CNP]"}, domiciliat/ă în ${extraData.employeeAddress || "[Adresă]"}`, 20, y, 170);
  y += 12;
  
  const articles = [
    {
      title: "Art. 1 - OBIECTUL CONTRACTULUI",
      text: `Angajatul va ocupa funcția de ${extraData.position || "[Funcție]"} în cadrul departamentului ${extraData.department || "[Departament]"}.`
    },
    {
      title: "Art. 2 - DURATA CONTRACTULUI",
      text: `Contractul se încheie pe durată nedeterminată, începând cu data de ${formatDate(extraData.startDate)}.`
    },
    {
      title: "Art. 3 - LOCUL DE MUNCĂ",
      text: `Activitatea se va desfășura la sediul angajatorului: ${companyData.address}.`
    },
    {
      title: "Art. 4 - DURATA MUNCII",
      text: `Durata timpului de lucru este de ${extraData.workSchedule || "8 ore/zi, 40 ore/săptămână"}, de luni până vineri.`
    },
    {
      title: "Art. 5 - SALARIUL",
      text: `Salariul de bază lunar brut este de ${extraData.salary || "[Salariu]"} RON. Plata se efectuează lunar, în data de 10 a lunii următoare.`
    },
    {
      title: "Art. 6 - CONCEDIUL DE ODIHNĂ",
      text: "Angajatul beneficiază de un concediu anual de odihnă de minimum 20 zile lucrătoare."
    },
    {
      title: "Art. 7 - DREPTURI ȘI OBLIGAȚII",
      text: "Drepturile și obligațiile părților sunt cele prevăzute în Codul Muncii și în prezentul contract."
    }
  ];
  
  articles.forEach(article => {
    if (y > 250) {
      addFooter(doc, doc.getNumberOfPages());
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(article.title, 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = addParagraph(doc, article.text, 20, y, 170);
    y += 8;
  });
  
  // Signatures
  if (y > 230) {
    addFooter(doc, doc.getNumberOfPages());
    doc.addPage();
    y = 20;
  }
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("ANGAJATOR,", 30, y);
  doc.text("ANGAJAT,", 130, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(companyData.companyName || "_________________", 30, y);
  doc.text(extraData.employeeName || "_________________", 130, y);
  y += 7;
  doc.text(`Prin: ${companyData.representative || "_________________"}`, 30, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Part-time Employment Contract
export const generatePartTimeContract = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Contract Individual de Muncă cu Timp Parțial", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  y = addParagraph(doc, `Încheiat astăzi, ${formatDate(extraData.startDate)}, între:`, 20, y, 170);
  y += 8;
  
  doc.setFont("helvetica", "bold");
  doc.text("ANGAJATOR:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${companyData.companyName}, cu sediul în ${companyData.address}, CUI ${companyData.cui}`, 20, y, 170);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.text("ANGAJAT:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${extraData.employeeName || "[Nume]"}, CNP ${extraData.employeeCNP || "[CNP]"}, domiciliat/ă în ${extraData.employeeAddress || "[Adresă]"}`, 20, y, 170);
  y += 12;
  
  const hoursPerWeek = (parseInt(extraData.hoursPerDay || "4") * 5).toString();
  
  const articles = [
    { title: "Art. 1 - FUNCȚIA", text: `Angajatul va ocupa funcția de ${extraData.position || "[Funcție]"}.` },
    { title: "Art. 2 - DURATA", text: `Contract pe durată nedeterminată, începând cu ${formatDate(extraData.startDate)}.` },
    { title: "Art. 3 - PROGRAM", text: `Durata muncii: ${extraData.hoursPerDay || "4"} ore/zi, ${hoursPerWeek} ore/săptămână.` },
    { title: "Art. 4 - SALARIU", text: `Salariul brut lunar: ${extraData.salary || "[Salariu]"} RON, proporțional cu timpul lucrat.` },
    { title: "Art. 5 - CONCEDIU", text: "Concediul de odihnă se acordă proporțional cu timpul efectiv lucrat." }
  ];
  
  articles.forEach(article => {
    doc.setFont("helvetica", "bold");
    doc.text(article.title, 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = addParagraph(doc, article.text, 20, y, 170);
    y += 8;
  });
  
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("ANGAJATOR,", 30, y);
  doc.text("ANGAJAT,", 130, y);
  y += 15;
  doc.line(30, y, 80, y);
  doc.line(130, y, 180, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Remote Work Contract
export const generateRemoteContract = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Contract Individual de Muncă cu Clauză de Telemuncă", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  y = addParagraph(doc, `Încheiat astăzi, ${formatDate(extraData.startDate)}, între părți, cu următoarele clauze specifice telemuncii:`, 20, y, 170);
  y += 10;
  
  const articles = [
    { title: "Art. 1 - PĂRȚILE", text: `Angajator: ${companyData.companyName} | Angajat: ${extraData.employeeName || "[Nume]"}, CNP ${extraData.employeeCNP || "[CNP]"}` },
    { title: "Art. 2 - FUNCȚIA", text: `${extraData.position || "[Funcție]"} cu activitate în regim de telemuncă.` },
    { title: "Art. 3 - LOCUL MUNCII", text: `Telemunca se desfășoară la: ${extraData.remoteLocation || "domiciliul angajatului"}, conform adresei: ${extraData.employeeAddress || "[Adresă]"}.` },
    { title: "Art. 4 - PROGRAM", text: "Program flexibil de 8 ore/zi. Angajatul trebuie să fie disponibil între orele 10:00-16:00." },
    { title: "Art. 5 - SALARIU", text: `Salariul brut lunar: ${extraData.salary || "[Salariu]"} RON.` },
    { title: "Art. 6 - ECHIPAMENTE", text: `Angajatorul asigură: ${extraData.equipmentProvided || "laptop, acces VPN, licențe software necesare"}.` },
    { title: "Art. 7 - OBLIGAȚII SPECIFICE", text: "Angajatul se obligă să: asigure confidențialitatea datelor; mențină un spațiu de lucru adecvat; raporteze progresul conform procedurilor interne." },
    { title: "Art. 8 - SECURITATE", text: "Angajatul respectă normele de securitate și sănătate în muncă și pentru telemuncă." }
  ];
  
  articles.forEach(article => {
    if (y > 250) {
      addFooter(doc, doc.getNumberOfPages());
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(article.title, 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = addParagraph(doc, article.text, 20, y, 170);
    y += 8;
  });
  
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("ANGAJATOR,", 30, y);
  doc.text("ANGAJAT,", 130, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Job Description
export const generateJobDescription = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Fișa Postului", companyData);
  
  doc.setFontSize(11);
  
  const sections = [
    { label: "Denumirea postului:", value: extraData.position || "[Denumire]" },
    { label: "Departament:", value: extraData.department || "[Departament]" },
    { label: "Superior ierarhic:", value: extraData.supervisor || "[Superior]" },
  ];
  
  sections.forEach(s => {
    doc.setFont("helvetica", "bold");
    doc.text(s.label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(s.value, 80, y);
    y += 8;
  });
  
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("RESPONSABILITĂȚI PRINCIPALE:", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  const responsibilities = (extraData.responsibilities || "- Responsabilitate 1\n- Responsabilitate 2").split("\n");
  responsibilities.forEach(r => {
    y = addParagraph(doc, r, 25, y, 165);
    y += 3;
  });
  
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("CERINȚE POST:", 20, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  const requirements = (extraData.requirements || "- Cerință 1\n- Cerință 2").split("\n");
  requirements.forEach(r => {
    y = addParagraph(doc, r, 25, y, 165);
    y += 3;
  });
  
  y += 20;
  doc.text(`Data întocmirii: ${formatDate()}`, 20, y);
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Am luat la cunoștință,", 20, y);
  y += 15;
  doc.line(20, y, 80, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Invoice Template
export const generateInvoice = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURĂ", pageWidth / 2, 25, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Nr. ${extraData.invoiceNumber || "001"}`, pageWidth / 2, 33, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${formatDate(extraData.invoiceDate)}`, pageWidth / 2, 40, { align: "center" });
  
  let y = 55;
  
  // Supplier info
  doc.setFont("helvetica", "bold");
  doc.text("FURNIZOR:", 20, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(companyData.companyName || "[Nume Furnizor]", 20, y);
  y += 5;
  doc.text(`CUI: ${companyData.cui || "[CUI]"}`, 20, y);
  y += 5;
  doc.text(companyData.address || "[Adresă]", 20, y);
  
  // Client info
  y = 55;
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT:", 110, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(extraData.clientName || "[Nume Client]", 110, y);
  y += 5;
  doc.text(`CUI: ${extraData.clientCui || "[CUI]"}`, 110, y);
  y += 5;
  doc.text(extraData.clientAddress || "[Adresă]", 110, y);
  
  y = 95;
  doc.line(20, y, 190, y);
  y += 10;
  
  // Table header
  doc.setFont("helvetica", "bold");
  doc.text("Descriere servicii/produse", 20, y);
  doc.text("Valoare", 160, y);
  y += 5;
  doc.line(20, y, 190, y);
  y += 10;
  
  // Services
  doc.setFont("helvetica", "normal");
  const services = (extraData.services || "Servicii - 0 RON").split("\n");
  services.forEach(service => {
    y = addParagraph(doc, service, 20, y, 130);
    y += 5;
  });
  
  y += 10;
  doc.line(20, y, 190, y);
  y += 10;
  
  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`TOTAL: ${extraData.totalAmount || "0"} RON`, 140, y);
  
  y += 30;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Semnătură și ștampilă furnizor:", 20, y);
  y += 15;
  doc.line(20, y, 80, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Service Contract
export const generateServiceContract = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  let y = addHeader(doc, "Contract de Prestări Servicii", companyData);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  y = addParagraph(doc, `Încheiat astăzi, ${formatDate(extraData.startDate)}, între:`, 20, y, 170);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.text("BENEFICIAR:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${companyData.companyName}, CUI ${companyData.cui}, cu sediul în ${companyData.address}`, 20, y, 170);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.text("PRESTATOR:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  y = addParagraph(doc, `${extraData.providerName || "[Nume]"}, CUI ${extraData.providerCui || "[CUI]"}, cu sediul în ${extraData.providerAddress || "[Adresă]"}`, 20, y, 170);
  y += 12;
  
  const articles = [
    { title: "Art. 1 - OBIECTUL CONTRACTULUI", text: `Prestatorul se obligă să furnizeze următoarele servicii: ${extraData.serviceDescription || "[Descriere servicii]"}` },
    { title: "Art. 2 - DURATA", text: `Contractul este valabil de la ${formatDate(extraData.startDate)} până la ${extraData.endDate ? formatDate(extraData.endDate) : "finalizarea serviciilor"}.` },
    { title: "Art. 3 - PREȚ ȘI PLATĂ", text: `Valoarea contractului: ${extraData.contractValue || "[Valoare]"} RON. Plata se efectuează în termen de 30 zile de la emiterea facturii.` },
    { title: "Art. 4 - OBLIGAȚIILE PRESTATORULUI", text: "Prestatorul se obligă să execute serviciile la standardele de calitate convenite și să respecte termenele stabilite." },
    { title: "Art. 5 - OBLIGAȚIILE BENEFICIARULUI", text: "Beneficiarul se obligă să furnizeze informațiile necesare și să efectueze plata la termen." },
    { title: "Art. 6 - CONFIDENȚIALITATE", text: "Părțile se obligă să păstreze confidențialitatea informațiilor obținute în executarea contractului." },
    { title: "Art. 7 - LITIGII", text: "Litigiile se soluționează pe cale amiabilă sau, în caz contrar, de instanțele competente." }
  ];
  
  articles.forEach(article => {
    if (y > 250) {
      addFooter(doc, doc.getNumberOfPages());
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(article.title, 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = addParagraph(doc, article.text, 20, y, 170);
    y += 8;
  });
  
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("BENEFICIAR,", 30, y);
  doc.text("PRESTATOR,", 130, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Self-Declaration
export const generateSelfDeclaration = (companyData: CompanyData, extraData: Record<string, string>): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("DECLARAȚIE PE PROPRIE RĂSPUNDERE", pageWidth / 2, 30, { align: "center" });
  
  let y = 50;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  y = addParagraph(doc, `Subsemnatul/a ${extraData.declarantName || "[Nume]"}, CNP ${extraData.declarantCNP || "[CNP]"}, domiciliat/ă în ${extraData.declarantAddress || "[Adresă]"},`, 20, y, 170);
  y += 15;
  
  doc.setFont("helvetica", "bold");
  doc.text("DECLAR PE PROPRIE RĂSPUNDERE:", 20, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  y = addParagraph(doc, extraData.declarationContent || "[Conținutul declarației]", 20, y, 170);
  y += 15;
  
  y = addParagraph(doc, "Dau prezenta declarație cunoscând prevederile art. 326 din Codul Penal privind falsul în declarații.", 20, y, 170);
  
  y += 25;
  doc.text(`Data: ${formatDate()}`, 20, y);
  doc.text("Semnătura:", 120, y);
  
  y += 20;
  doc.line(120, y, 180, y);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
};

// Main generator function
export const generateDocument = (
  documentId: string,
  companyData: CompanyData,
  extraData: Record<string, string>
): jsPDF | null => {
  switch (documentId) {
    case "1": return generatePrivacyPolicy(companyData, extraData);
    case "2": return generateDataRegistry(companyData, extraData);
    case "3": return generateDataProcessingAgreement(companyData, extraData);
    case "4": return generateEmployeeGDPRConsent(companyData, extraData);
    case "5": return generateFullTimeContract(companyData, extraData);
    case "6": return generatePartTimeContract(companyData, extraData);
    case "7": return generateRemoteContract(companyData, extraData);
    case "8": return generateJobDescription(companyData, extraData);
    case "9": return generateInvoice(companyData, extraData);
    case "10": return generateServiceContract(companyData, extraData);
    case "11": return generateSelfDeclaration(companyData, extraData);
    default: return null;
  }
};

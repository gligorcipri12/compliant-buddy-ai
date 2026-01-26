// Document template definitions for PDF generation

export interface DocumentTemplate {
  id: string;
  name: string;
  category: "gdpr" | "contracts" | "fiscal";
  fields: DocumentField[];
}

export interface DocumentField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface CompanyData {
  companyName: string;
  cui: string;
  address: string;
  employees: string;
  representative: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
}

export interface EmployeeData {
  employeeName: string;
  employeeCNP: string;
  employeeAddress: string;
  position: string;
  department: string;
  salary: string;
  startDate: string;
  workSchedule: string;
}

export const documentTemplates: Record<string, DocumentTemplate> = {
  // GDPR Documents
  "1": {
    id: "1",
    name: "Politică de Confidențialitate",
    category: "gdpr",
    fields: [
      { name: "websiteUrl", label: "Website", type: "text", required: false, placeholder: "www.exemplu.ro" },
      { name: "dataTypes", label: "Tipuri de date colectate", type: "textarea", required: false, placeholder: "nume, email, telefon..." },
      { name: "dataProcessingPurpose", label: "Scopul prelucrării datelor", type: "textarea", required: false, placeholder: "marketing, facturare..." },
    ],
  },
  "2": {
    id: "2",
    name: "Registru Prelucrare Date",
    category: "gdpr",
    fields: [
      { name: "dataCategories", label: "Categorii de date", type: "textarea", required: false, placeholder: "date identificare, date contact..." },
      { name: "retentionPeriod", label: "Perioada de retenție", type: "text", required: false, placeholder: "5 ani" },
    ],
  },
  "3": {
    id: "3",
    name: "Contract Procesare Date",
    category: "gdpr",
    fields: [
      { name: "processorName", label: "Nume împuternicit", type: "text", required: true, placeholder: "SC Procesator SRL" },
      { name: "processorCui", label: "CUI împuternicit", type: "text", required: true, placeholder: "RO12345678" },
      { name: "processorAddress", label: "Adresă împuternicit", type: "text", required: true, placeholder: "Str. Exemplu, Nr. 1" },
      { name: "dataTypes", label: "Tipuri de date procesate", type: "textarea", required: false, placeholder: "date clienți, date angajați..." },
    ],
  },
  "4": {
    id: "4",
    name: "Acord Prelucrare Angajați",
    category: "gdpr",
    fields: [
      { name: "employeeName", label: "Nume angajat", type: "text", required: true, placeholder: "Ion Popescu" },
      { name: "employeeCNP", label: "CNP angajat", type: "text", required: true, placeholder: "1234567890123" },
    ],
  },
  // Labor Contracts
  "5": {
    id: "5",
    name: "CIM Full-Time",
    category: "contracts",
    fields: [
      { name: "employeeName", label: "Nume angajat", type: "text", required: true, placeholder: "Ion Popescu" },
      { name: "employeeCNP", label: "CNP angajat", type: "text", required: true, placeholder: "1234567890123" },
      { name: "employeeAddress", label: "Adresă angajat", type: "text", required: true, placeholder: "Str. Exemplu, Nr. 1" },
      { name: "position", label: "Funcția", type: "text", required: true, placeholder: "Programator" },
      { name: "department", label: "Departament", type: "text", required: false, placeholder: "IT" },
      { name: "salary", label: "Salariu brut (RON)", type: "number", required: true, placeholder: "5000" },
      { name: "startDate", label: "Data începere", type: "date", required: true, placeholder: "" },
      { name: "workSchedule", label: "Program lucru", type: "select", required: true, options: ["8 ore/zi, 40 ore/săptămână", "Flexibil", "Ture"] },
    ],
  },
  "6": {
    id: "6",
    name: "CIM Part-Time",
    category: "contracts",
    fields: [
      { name: "employeeName", label: "Nume angajat", type: "text", required: true, placeholder: "Ion Popescu" },
      { name: "employeeCNP", label: "CNP angajat", type: "text", required: true, placeholder: "1234567890123" },
      { name: "employeeAddress", label: "Adresă angajat", type: "text", required: true, placeholder: "Str. Exemplu, Nr. 1" },
      { name: "position", label: "Funcția", type: "text", required: true, placeholder: "Programator" },
      { name: "hoursPerDay", label: "Ore/zi", type: "number", required: true, placeholder: "4" },
      { name: "salary", label: "Salariu brut (RON)", type: "number", required: true, placeholder: "2500" },
      { name: "startDate", label: "Data începere", type: "date", required: true, placeholder: "" },
    ],
  },
  "7": {
    id: "7",
    name: "CIM Remote/Telemuncă",
    category: "contracts",
    fields: [
      { name: "employeeName", label: "Nume angajat", type: "text", required: true, placeholder: "Ion Popescu" },
      { name: "employeeCNP", label: "CNP angajat", type: "text", required: true, placeholder: "1234567890123" },
      { name: "employeeAddress", label: "Adresă angajat", type: "text", required: true, placeholder: "Str. Exemplu, Nr. 1" },
      { name: "remoteLocation", label: "Locația telemuncii", type: "text", required: true, placeholder: "Domiciliu" },
      { name: "position", label: "Funcția", type: "text", required: true, placeholder: "Programator" },
      { name: "salary", label: "Salariu brut (RON)", type: "number", required: true, placeholder: "5000" },
      { name: "startDate", label: "Data începere", type: "date", required: true, placeholder: "" },
      { name: "equipmentProvided", label: "Echipamente furnizate", type: "textarea", required: false, placeholder: "Laptop, monitor..." },
    ],
  },
  "8": {
    id: "8",
    name: "Fișa Postului",
    category: "contracts",
    fields: [
      { name: "position", label: "Denumire post", type: "text", required: true, placeholder: "Programator Senior" },
      { name: "department", label: "Departament", type: "text", required: true, placeholder: "IT" },
      { name: "supervisor", label: "Superior ierarhic", type: "text", required: true, placeholder: "Director IT" },
      { name: "responsibilities", label: "Responsabilități principale", type: "textarea", required: true, placeholder: "- Dezvoltare software\n- Mentenanță sisteme..." },
      { name: "requirements", label: "Cerințe post", type: "textarea", required: true, placeholder: "- Studii superioare\n- 3 ani experiență..." },
    ],
  },
  // Fiscal Documents
  "9": {
    id: "9",
    name: "Model Factură",
    category: "fiscal",
    fields: [
      { name: "clientName", label: "Nume client", type: "text", required: true, placeholder: "SC Client SRL" },
      { name: "clientCui", label: "CUI client", type: "text", required: true, placeholder: "RO12345678" },
      { name: "clientAddress", label: "Adresă client", type: "text", required: true, placeholder: "Str. Client, Nr. 1" },
      { name: "invoiceNumber", label: "Număr factură", type: "text", required: true, placeholder: "001" },
      { name: "invoiceDate", label: "Data facturii", type: "date", required: true, placeholder: "" },
      { name: "services", label: "Servicii/Produse", type: "textarea", required: true, placeholder: "Servicii consultanță - 1000 RON" },
      { name: "totalAmount", label: "Total (RON)", type: "number", required: true, placeholder: "1000" },
    ],
  },
  "10": {
    id: "10",
    name: "Contract Prestări Servicii",
    category: "fiscal",
    fields: [
      { name: "providerName", label: "Nume prestator", type: "text", required: true, placeholder: "PFA Ion Popescu" },
      { name: "providerCui", label: "CUI prestator", type: "text", required: true, placeholder: "12345678" },
      { name: "providerAddress", label: "Adresă prestator", type: "text", required: true, placeholder: "Str. Exemplu, Nr. 1" },
      { name: "serviceDescription", label: "Descriere servicii", type: "textarea", required: true, placeholder: "Servicii de programare și dezvoltare software" },
      { name: "contractValue", label: "Valoare contract (RON)", type: "number", required: true, placeholder: "5000" },
      { name: "startDate", label: "Data începere", type: "date", required: true, placeholder: "" },
      { name: "endDate", label: "Data încheiere", type: "date", required: false, placeholder: "" },
    ],
  },
  "11": {
    id: "11",
    name: "Declarație pe Proprie Răspundere",
    category: "fiscal",
    fields: [
      { name: "declarantName", label: "Nume declarant", type: "text", required: true, placeholder: "Ion Popescu" },
      { name: "declarantCNP", label: "CNP declarant", type: "text", required: true, placeholder: "1234567890123" },
      { name: "declarantAddress", label: "Adresă declarant", type: "text", required: true, placeholder: "Str. Exemplu, Nr. 1" },
      { name: "declarationContent", label: "Conținut declarație", type: "textarea", required: true, placeholder: "Declar pe proprie răspundere că..." },
    ],
  },
};

# Trusted Medicine Data Contract

This app must treat Firestore trusted-source records as the source of truth for medicine information. Gemini may explain or simplify a selected trusted record, but it must not create medicine facts, dosage advice, drug warnings, interactions, contraindications, or regulatory status.

## Firestore Collections

Create these top-level Firestore collections:

```text
ip_drugs
drug_labels
drug_names
drug_classes
regulatory_alerts
verified_medicines
```

Every searchable document should include these required fields:

```json
{
  "sourceStatus": "verified",
  "name": "Paracetamol",
  "nameLower": "paracetamol",
  "summary": "Trusted source summary only.",
  "citations": [
    {
      "sourceKey": "IPC_IP",
      "sourceName": "Indian Pharmacopoeia Commission",
      "sourceUrl": "https://iponline.ipc.gov.in/",
      "retrievedAt": "2026-05-16",
      "documentId": "IP-2022-Paracetamol",
      "revisionDate": "2022"
    }
  ]
}
```

Use `sourceStatus: "verified"` only after an admin has reviewed the source. Use `draft` while preparing data and `retired` for obsolete records.

## Collection Purpose

`ip_drugs`  
IPC/IP curated monograph data: standards, assay, storage, impurities, container, label claim.

`drug_labels`  
DailyMed/openFDA label data: indications, warnings, contraindications, dosage forms, adverse reactions, source label text.

`drug_names`  
RxNorm normalized names: generic names, brand names, RxCUI, dose form names, synonym mapping.

`drug_classes`  
WHO ATC classification: ATC code, therapeutic class, pharmacological class, DDD metadata if allowed by source/license.

`regulatory_alerts`  
CDSCO/FDA safety alerts, recalls, bans, restrictions, official notices.

`verified_medicines`  
Manually verified/admin-approved product records used by QR verification or packaging checks.

## Optional Fields

```json
{
  "genericName": "Acetaminophen",
  "brandNames": ["Crocin", "Tylenol"],
  "category": "Analgesic/Antipyretic",
  "uses": ["Used for pain and fever when supported by the source label."],
  "dosageForms": ["Tablet", "Syrup"],
  "warnings": ["Do not exceed the source label warning text."],
  "contraindications": [],
  "sideEffects": [],
  "storage": "Store according to source monograph/label.",
  "sourceText": "Short quoted/paraphrased source-backed text only.",
  "updatedAt": "Firestore serverTimestamp"
}
```

## Source Keys

```text
IPC_IP
DAILYMED_OPENFDA
RXNORM
WHO_ATC
CDSCO_FDA_ALERT
MANUAL_VERIFIED
```

## App Guardrail

Allowed:

```text
Trusted Firestore record -> Gemini explanation/simplification -> display with citations
```

Not allowed:

```text
User medicine query -> Gemini generates medicine facts -> display as source data
```

If a medicine has no verified Firestore record, the UI should say no trusted record is available.

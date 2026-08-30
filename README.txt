# FormSaathi AI 🇮🇳

### AI-Powered Multilingual Form Assistance Platform

> **Understand forms. Find the information. Fill with confidence.**

FormSaathi AI is an accessibility-focused web application designed to help users understand and complete complex, English-heavy forms in their preferred language.

Instead of simply translating a form, FormSaathi AI explains **what information is required, where that information can be found, and exactly where it should be entered on the form**.

The initial prototype focuses on **Tamil + English** support.

---

## 🚀 Problem

Many official forms used in banking, government services, education, healthcare, and other public services are primarily available in English.

For users who are more comfortable with Tamil, this creates difficulties such as:

- Understanding unfamiliar English terminology
- Knowing what information a field requires
- Finding the required information in their documents
- Identifying where exactly to enter the information
- Understanding complicated instructions
- Completing physical forms independently

Traditional translation systems mainly solve the language barrier, but they do not necessarily solve the **form-completion problem**.

---

## 💡 Our Solution

FormSaathi AI combines OCR, intelligent field detection, a verified knowledge base, and multilingual guidance into a single workflow.

### Core Concept

**WHAT → WHERE → WHERE TO WRITE**

For every recognized field, FormSaathi AI provides:

### 📝 What should I fill?

Explains what information the user needs to enter.

### 📍 Where can I find it?

Explains where the required information can be found, such as a passbook or identity document.

### 🟢 Where should I write it?

Highlights the relevant location on the original form.

---

## ✨ Key Features

### 🌐 Multilingual Interface

Users can select their preferred language.

The current prototype supports:

- 🇮🇳 Tamil
- 🇬🇧 English

Tamil is the primary language, with English available as a secondary reference.

---

### 📄 Physical Form Assistance

Users can upload or scan a physical form.

Supported input options include:

- 📷 Camera / Photo
- 📁 Image Upload
- 📄 PDF

The uploaded form is analyzed to identify relevant fields.

---

### 🔍 OCR-Based Form Analysis

FormSaathi AI uses **PaddleOCR** to extract text from uploaded forms.

The OCR pipeline extracts:

- Text
- Confidence
- Bounding box coordinates

These coordinates are used to locate detected fields on the original form.

---

### 🧠 Intelligent Field Detection

OCR output is normalized and mapped to known form fields.

Examples:

```text
Account Number
Account No
A/C Number
A/C No
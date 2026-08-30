# 🪪 Intern ID Card Generator

**Gift a Smile Foundation**

A frontend web app that generates a printable, dual-sided Intern ID card as a PDF. It captures the intern's photo and name, fetches a unique sequential Intern ID from a Google Apps Script backend, draws everything onto a pre-designed ID card template, embeds a QR code encoding the Intern ID, and exports the result as a downloadable PDF.

---

## 🚀 Features

- Photo capture/upload with live preview
- Auto-generated sequential Intern ID (e.g. `NIVA-KIET-MBA-001`) fetched from a Google Apps Script backend
- QR code generated client-side, encoding only the Intern ID
- Photo is auto-cropped into a circle with "cover" behavior (no stretching, no distortion)
- Long names auto-shrink to fit within the card layout
- All elements (photo, name, Intern ID, QR) drawn onto a template image via HTML5 Canvas
- Exports a 2-page PDF: front of the ID card (canvas) + a static back-side image
- Fully frontend-based — no backend hosting required beyond the Apps Script Web App

---

## 🛠️ Tech Stack

- HTML5 / CSS3
- JavaScript (Vanilla JS, no framework)
- [QRCode.js](https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js) — QR generation
- [jsPDF](https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js) — PDF export (loaded dynamically on first download)
- Google Apps Script — backend for generating sequential Intern IDs (connected to Google Sheets)

---

## 📁 Project Structure

```
intern-id-card-generator/
│
├── index.html
├── style.css
├── script3.js
├── assets/
│   ├── id_front.png   ← ID card front template
│   └── id_back.png    ← ID card back template
└── README.md
```

> **Note:** The `assets/id_front.png` and `assets/id_back.png` template images are required for the app to work — they are referenced in `CONFIG.templateSrc` and `CONFIG.secondPageSrc` but not included by default. Add your own template images at those paths.

---

## ⚙️ How It Works

1. User uploads/captures a photo — a live preview is shown.
2. User fills in Name, College, Course, Branch (optional), and Email.
3. On submit:
   - A request is sent to the Google Apps Script Web App to generate the next sequential Intern ID for that name.
   - A QR code is generated client-side, encoding **only the Intern ID**.
   - The front template image is loaded onto an HTML5 canvas.
   - The intern's photo is cropped into a circle and drawn onto the canvas.
   - The name (uppercased, auto-shrinking font if too long) and Intern ID are drawn as text.
   - The QR code is drawn onto the canvas.
4. A "Download ID Card PDF" button appears.
5. On download:
   - Page 1 of the PDF is the generated canvas (front of the card).
   - Page 2 is the static back-side template image.
   - The PDF is saved as `{InternID}-ID-Card.pdf`.

---

## 📥 Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/vanshgupta-git/student-qr-generator-old
   ```
2. Add your ID card template images to `assets/id_front.png` and `assets/id_back.png`.
3. Deploy your own Google Apps Script Web App (connected to a Google Sheet) that handles the `generateInternId` action and returns `{ success: true, internId: "..." }`.
4. Update `CONFIG.apiUrl` in `script3.js` with your deployed Apps Script Web App URL.
5. Open `index.html` in a browser.

No build step or local server required — the app runs entirely from static files.

---

## 🎛️ Configuration

All visual and backend settings live in the `CONFIG` object at the top of `script3.js`:

| Section | What it controls |
|---|---|
| `templateSrc` / `secondPageSrc` | Front and back template images |
| `canvas` | Canvas dimensions (should match the template image size) |
| `photo` | Position and size of the circular photo on the card |
| `name` | Position, font size, color, and max width for the intern's name |
| `internId` | Position and styling for the Intern ID text |
| `qr` | Position and size of the QR code |
| `id` | Prefix and digit padding for generated Intern IDs |
| `apiUrl` | Your deployed Google Apps Script Web App URL |

---

## 🔌 Backend Contract

The frontend expects a POST request to `CONFIG.apiUrl` with:

```json
{
  "action": "generateInternId",
  "name": "Intern Name"
}
```

And expects a JSON response of:

```json
{
  "success": true,
  "internId": "NIVA-KIET-MBA-001"
}
```

or, on failure:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📌 Future Improvements

- Email the generated ID card PDF directly to the intern
- Admin dashboard for tracking issued IDs
- Bulk ID generation from a CSV/Sheet
- Better error handling for offline/slow network scenarios
- Persist generated card previews for re-download without regenerating

---

## 🤝 Contribution

Pull requests are welcome. For major changes, open an issue first.

---

## 👨‍💻 Author

Vansh — Web Development Intern, IT & Digital Operations, Gift a Smile Foundation
# AI Health Vision

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Patient authentication (Internet Identity / email-style login)
- Patient profile with medical history section
- Camera capture and image/video upload (JPG, PNG, MP4)
- AI medical image analysis (simulated classification engine) for: fungal infection, skin rash, wound infection, dental infection, swelling
- AI response card: possible condition, confidence level, treatment advice, OTC medicines, consultation recommendation
- Emergency detection banner: "Please visit nearest hospital immediately" for high-severity results
- Doctor Connect section: appointment booking form, chat UI, video consultation placeholder
- Medical report view: patient info + AI analysis + recommendations (printable layout)
- Diagnosis history list per patient
- Admin panel: monitor all cases, approve/reject doctors, review AI predictions
- Blob storage for patient images and attachments
- Authorization/role-based access (patient, doctor, admin roles)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
1. Authorization component for role-based access (patient, doctor, admin)
2. Blob storage component for image/video uploads
3. Patient profile actor: create/update profile, store medical history
4. Diagnosis actor: store diagnosis records (condition, confidence, advice, medicines, severity, timestamp, image ref)
5. Doctor actor: doctor profiles, appointment slots, booking management, doctor notes
6. Admin actor: list all cases, approve/reject doctors, review flagged predictions
7. AI analysis function: deterministic rule-based image classifier (based on filename/metadata heuristics + random seed logic to simulate confidence scores) -- returns condition, confidence, severity, treatment, medicines

### Frontend (React + TypeScript)
1. Landing page with app branding and login CTA
2. Auth flow (login/register with patient profile setup)
3. Dashboard: recent diagnoses, quick upload CTA, profile summary
4. Upload & Analysis page: camera capture (WebRTC), file upload, analysis trigger, results card
5. Diagnosis history page: list of past diagnoses with detail drawer
6. Doctor Connect page: appointment booking form, mock chat UI, video placeholder
7. Medical Report page: printable report layout per diagnosis
8. Admin Panel: cases table, doctor approval queue, prediction review
9. Responsive mobile-first layout

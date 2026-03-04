import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface DoctorProfile {
    bio: string;
    name: string;
    specialty: string;
    approved: boolean;
    availableSlots: Array<Time>;
    licenseNumber: string;
}
export interface BasicPatientInfo {
    age: bigint;
    bloodType?: string;
    name: string;
    gender: Gender;
    phone: string;
    existingConditions: Array<string>;
    allergies: Array<string>;
}
export interface MedicalHistoryEntry {
    notes: string;
    timestamp: Time;
}
export interface DiagnosisRecord {
    id: string;
    isEmergency: boolean;
    doctorNotes?: string;
    patientId: Principal;
    conditionName: string;
    treatmentAdvice: string;
    confidenceScore: bigint;
    consultationRecommended: boolean;
    imageRef: ExternalBlob;
    timestamp: Time;
    severity: Severity;
    otcMedicines: Array<string>;
}
export interface DiagnosticResult {
    isEmergency: boolean;
    conditionName: string;
    treatmentAdvice: string;
    confidenceScore: bigint;
    consultationRecommended: boolean;
    severity: Severity;
    otcMedicines: Array<string>;
}
export interface PatientProfile {
    info: BasicPatientInfo;
    medicalHistory: Array<MedicalHistoryEntry>;
}
export interface Appointment {
    doctorId: Principal;
    patientId: Principal;
    dateTime: Time;
    reason: string;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum Severity {
    low = "low",
    emergency = "emergency",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMedicalHistoryEntry(entry: MedicalHistoryEntry): Promise<void>;
    analyze(imageRef: ExternalBlob): Promise<DiagnosticResult>;
    approveDoctor(doctorId: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(appointment: Appointment): Promise<void>;
    createOrUpdateDoctorProfile(profile: DoctorProfile): Promise<void>;
    createOrUpdatePatientProfile(profile: PatientProfile): Promise<void>;
    getAllDiagnoses(start: bigint, end: bigint): Promise<Array<DiagnosisRecord>>;
    getApprovedDoctors(): Promise<Array<DoctorProfile>>;
    getCallerUserProfile(): Promise<BasicPatientInfo | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        totalPatients: bigint;
        totalDiagnoses: bigint;
        emergencyCases: bigint;
        pendingDoctors: bigint;
    }>;
    getDiagnosisById(id: string): Promise<DiagnosisRecord>;
    getDoctorAppointments(start: bigint, end: bigint): Promise<Array<Appointment>>;
    getMedicalHistory(): Promise<Array<MedicalHistoryEntry>>;
    getOwnPatientProfile(): Promise<PatientProfile>;
    getPatientAppointments(start: bigint, end: bigint): Promise<Array<Appointment>>;
    getPatientDiagnoses(start: bigint, end: bigint): Promise<Array<DiagnosisRecord>>;
    getUserProfile(user: Principal): Promise<BasicPatientInfo | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectDoctor(doctorId: Principal): Promise<void>;
    saveCallerUserProfile(profile: BasicPatientInfo): Promise<void>;
    submitDiagnosis(record: DiagnosisRecord): Promise<void>;
    updateDoctorNotes(diagnosisId: string, notes: string): Promise<void>;
}

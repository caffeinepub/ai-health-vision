import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type {
  Appointment,
  BasicPatientInfo,
  DiagnosisRecord,
  DiagnosticResult,
  DoctorProfile,
  MedicalHistoryEntry,
  PatientProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Auth & Profile ──────────────────────────────────────────────────────────

export function useCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole | null>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<BasicPatientInfo | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOwnPatientProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<PatientProfile | null>({
    queryKey: ["ownPatientProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getOwnPatientProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: BasicPatientInfo) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["ownPatientProfile"] });
    },
  });
}

export function useCreateOrUpdatePatientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: PatientProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrUpdatePatientProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["ownPatientProfile"] });
    },
  });
}

export function useMedicalHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<MedicalHistoryEntry[]>({
    queryKey: ["medicalHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMedicalHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMedicalHistoryEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: MedicalHistoryEntry) => {
      if (!actor) throw new Error("Not connected");
      return actor.addMedicalHistoryEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
    },
  });
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export function useAnalyze() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (imageRef: ExternalBlob): Promise<DiagnosticResult> => {
      if (!actor) throw new Error("Not connected");
      return actor.analyze(imageRef);
    },
  });
}

export function useSubmitDiagnosis() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: DiagnosisRecord) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return actor.submitDiagnosis(record as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientDiagnoses"] });
      queryClient.invalidateQueries({ queryKey: ["diagnosisById"] });
    },
  });
}

export function usePatientDiagnoses(start = 0n, end = 10n) {
  const { actor, isFetching } = useActor();
  return useQuery<DiagnosisRecord[]>({
    queryKey: ["patientDiagnoses", start.toString(), end.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPatientDiagnoses(start, end);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDiagnosisById(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DiagnosisRecord | null>({
    queryKey: ["diagnosisById", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getDiagnosisById(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export function useApprovedDoctors() {
  const { actor, isFetching } = useActor();
  return useQuery<DoctorProfile[]>({
    queryKey: ["approvedDoctors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedDoctors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointment: Appointment) => {
      if (!actor) throw new Error("Not connected");
      return actor.bookAppointment(appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
    },
  });
}

export function usePatientAppointments(start = 0n, end = 20n) {
  const { actor, isFetching } = useActor();
  return useQuery<Appointment[]>({
    queryKey: ["patientAppointments", start.toString(), end.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPatientAppointments(start, end);
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    totalPatients: bigint;
    totalDiagnoses: bigint;
    emergencyCases: bigint;
    pendingDoctors: bigint;
  } | null>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllDiagnoses(start = 0n, end = 50n) {
  const { actor, isFetching } = useActor();
  return useQuery<DiagnosisRecord[]>({
    queryKey: ["allDiagnoses", start.toString(), end.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDiagnoses(start, end);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      doctorId: import("@icp-sdk/core/principal").Principal,
    ) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveDoctor(doctorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedDoctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useRejectDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      doctorId: import("@icp-sdk/core/principal").Principal,
    ) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectDoctor(doctorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedDoctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateDoctorNotes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      diagnosisId,
      notes,
    }: {
      diagnosisId: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateDoctorNotes(diagnosisId, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDiagnoses"] });
      queryClient.invalidateQueries({ queryKey: ["diagnosisById"] });
    },
  });
}

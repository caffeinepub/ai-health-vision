import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  FileText,
  Heart,
  Pill,
  Printer,
  Stethoscope,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { Severity } from "../backend.d";
import SeverityBadge from "../components/SeverityBadge";
import { useCallerUserProfile, useDiagnosisById } from "../hooks/useQueries";
import {
  confidenceToPercent,
  formatDateTime,
  nsToDate,
} from "../utils/helpers";

export default function ReportPage() {
  const { id } = useParams({ from: "/auth/report/$id" });
  const { data: diagnosis, isLoading } = useDiagnosisById(id);
  const { data: profile } = useCallerUserProfile();

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <FileText size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-xl font-bold">Report Not Found</h2>
        <p className="text-muted-foreground text-sm mt-2">
          This report may not exist or hasn't been saved yet.
        </p>
      </div>
    );
  }

  const confidence = confidenceToPercent(diagnosis.confidenceScore);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl">
      {/* Print Button */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Medical Report
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-generated analysis report
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          className="gap-2 medical-gradient text-white border-0"
          data-ocid="report.primary_button"
        >
          <Printer size={16} />
          Print Report
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="print-container bg-card rounded-2xl border border-border shadow-card overflow-hidden"
      >
        {/* Report Header */}
        <div className="medical-gradient p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                AI Health Vision
              </h2>
              <p className="text-white/70 text-xs">
                Preliminary Medical Analysis Report
              </p>
            </div>
          </div>
          <div className="h-px bg-white/20 mb-4" />
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                Report ID
              </p>
              <p className="text-white font-mono text-sm">{diagnosis.id}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="text-white text-sm">
                {formatDateTime(nsToDate(diagnosis.timestamp))}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        {profile && (
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <User size={14} />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Name", value: profile.name },
                { label: "Age", value: `${Number(profile.age)} years` },
                { label: "Gender", value: profile.gender },
                { label: "Phone", value: profile.phone },
                ...(profile.bloodType
                  ? [{ label: "Blood Type", value: profile.bloodType }]
                  : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Image */}
        {diagnosis.imageRef && (
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <CalendarDays size={14} />
              Analyzed Image
            </h3>
            <img
              src={diagnosis.imageRef.getDirectURL()}
              alt="Analyzed health scan"
              className="rounded-xl border border-border max-h-64 object-contain w-full bg-secondary/20"
            />
          </div>
        )}

        {/* AI Analysis */}
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Stethoscope size={14} />
            AI Analysis Results
          </h3>

          {/* Emergency */}
          {diagnosis.isEmergency && (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-4 flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-600 shrink-0" />
              <div>
                <p className="font-bold text-red-700">⚠️ Emergency Condition</p>
                <p className="text-sm text-red-600">
                  Please visit the nearest hospital immediately.
                </p>
              </div>
            </div>
          )}

          {/* Condition & Severity */}
          <div className="bg-secondary/30 rounded-xl p-4 mb-4 border border-border">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Detected Condition
                </p>
                <h4 className="font-display text-xl font-bold text-foreground">
                  {diagnosis.conditionName}
                </h4>
              </div>
              <SeverityBadge severity={diagnosis.severity} />
            </div>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                confidence >= 80
                  ? "text-green-600 bg-green-50 border-green-200"
                  : confidence >= 60
                    ? "text-amber-600 bg-amber-50 border-amber-200"
                    : "text-red-600 bg-red-50 border-red-200"
              }`}
            >
              {confidence}% Confidence
            </div>
            <span className="text-sm text-muted-foreground">
              Severity:{" "}
              <span className="font-medium">
                {diagnosis.severity === Severity.low && "Low"}
                {diagnosis.severity === Severity.medium && "Medium"}
                {diagnosis.severity === Severity.high && "High"}
                {diagnosis.severity === Severity.emergency && "Emergency"}
              </span>
            </span>
          </div>

          {/* Treatment */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Treatment Advice
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {diagnosis.treatmentAdvice}
            </p>
          </div>

          {/* OTC Medicines */}
          {diagnosis.otcMedicines.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Pill size={11} />
                Suggested OTC Medicines
              </p>
              <div className="flex flex-wrap gap-2">
                {diagnosis.otcMedicines.map((med) => (
                  <Badge key={med} variant="secondary" className="text-xs">
                    {med}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Consultation */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30 border border-border">
            <CheckCircle
              size={16}
              className={
                diagnosis.consultationRecommended
                  ? "text-amber-600"
                  : "text-green-600"
              }
            />
            <p className="text-sm">
              <span className="font-medium">Doctor Consultation: </span>
              <span
                className={
                  diagnosis.consultationRecommended
                    ? "text-amber-600"
                    : "text-green-600"
                }
              >
                {diagnosis.consultationRecommended
                  ? "Recommended"
                  : "Not required"}
              </span>
            </p>
          </div>
        </div>

        {/* Doctor Notes */}
        {diagnosis.doctorNotes && (
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Doctor Notes
            </h3>
            <p className="text-sm text-foreground leading-relaxed bg-secondary/30 p-4 rounded-xl border border-border">
              {diagnosis.doctorNotes}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-bold">⚠️ Important Disclaimer: </span>
              This is a preliminary AI analysis only and should not replace
              professional medical advice, diagnosis, or treatment. Always
              consult a qualified and licensed medical professional for proper
              diagnosis and treatment of any health condition. In case of
              emergency, contact emergency services immediately.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Generated by AI Health Vision</span>
            <span>{formatDateTime(nsToDate(diagnosis.timestamp))}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

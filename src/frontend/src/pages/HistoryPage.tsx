import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  MessageSquare,
  Pill,
  Stethoscope,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { DiagnosisRecord } from "../backend.d";
import EmergencyBanner from "../components/EmergencyBanner";
import SeverityBadge from "../components/SeverityBadge";
import { usePatientDiagnoses } from "../hooks/useQueries";
import {
  confidenceToPercent,
  formatDate,
  formatDateTime,
  nsToDate,
} from "../utils/helpers";

const PAGE_SIZE = 10n;

export default function HistoryPage() {
  const [page, setPage] = useState(0n);
  const [selectedDiagnosis, setSelectedDiagnosis] =
    useState<DiagnosisRecord | null>(null);

  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const { data: diagnoses = [], isLoading } = usePatientDiagnoses(start, end);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Analysis History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review your past AI health analyses and reports
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="history.loading_state">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : diagnoses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl border border-border p-12 text-center"
          data-ocid="history.empty_state"
        >
          <ClipboardList
            size={40}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <h3 className="font-semibold text-foreground mb-2">
            No analyses yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Your analysis history will appear here after you submit your first
            health image.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3" data-ocid="history.list">
          {diagnoses.map((diagnosis, idx) => (
            <motion.div
              key={diagnosis.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all cursor-pointer"
              data-ocid={`history.item.${idx + 1}`}
              onClick={() => setSelectedDiagnosis(diagnosis)}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {diagnosis.conditionName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays size={10} />
                          {formatDate(nsToDate(diagnosis.timestamp))}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {confidenceToPercent(diagnosis.confidenceScore)}%
                          confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={diagnosis.severity} />
                      {diagnosis.isEmergency && (
                        <Badge
                          variant="destructive"
                          className="text-xs hidden sm:flex"
                        >
                          Emergency
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {diagnoses.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0n}
            onClick={() => setPage((p) => p - 1n)}
            className="gap-2"
            data-ocid="history.pagination_prev"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {Number(page) + 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={diagnoses.length < Number(PAGE_SIZE)}
            onClick={() => setPage((p) => p + 1n)}
            className="gap-2"
            data-ocid="history.pagination_next"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedDiagnosis && (
          <Sheet
            open={!!selectedDiagnosis}
            onOpenChange={() => setSelectedDiagnosis(null)}
          >
            <SheetContent
              side="right"
              className="w-full sm:max-w-lg overflow-y-auto"
            >
              <SheetHeader className="mb-6">
                <SheetTitle className="font-display text-xl">
                  Analysis Details
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-5">
                {/* Emergency */}
                {selectedDiagnosis.isEmergency && <EmergencyBanner />}

                {/* Header info */}
                <div className="medical-gradient rounded-xl p-4 text-white">
                  <p className="text-white/70 text-xs mb-1 uppercase tracking-wider">
                    Detected Condition
                  </p>
                  <h2 className="font-display text-xl font-bold">
                    {selectedDiagnosis.conditionName}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <SeverityBadge
                      severity={selectedDiagnosis.severity}
                      className="bg-white/20 border-white/30 text-white"
                    />
                    <span className="text-white/80 text-sm">
                      {confidenceToPercent(selectedDiagnosis.confidenceScore)}%
                      confidence
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays size={14} />
                  {formatDateTime(nsToDate(selectedDiagnosis.timestamp))}
                </div>

                {/* Image */}
                {selectedDiagnosis.imageRef && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Eye size={14} />
                      Uploaded Image
                    </h3>
                    <img
                      src={selectedDiagnosis.imageRef.getDirectURL()}
                      alt="Medical analysis"
                      className="rounded-xl border border-border max-h-48 object-contain w-full bg-secondary/20"
                    />
                  </div>
                )}

                {/* Treatment */}
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Stethoscope size={14} />
                    Treatment Advice
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedDiagnosis.treatmentAdvice}
                  </p>
                </div>

                {/* OTC */}
                {selectedDiagnosis.otcMedicines.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Pill size={14} />
                      Suggested Medicines
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDiagnosis.otcMedicines.map((med) => (
                        <Badge
                          key={med}
                          variant="secondary"
                          className="text-xs"
                        >
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Notes */}
                {selectedDiagnosis.doctorNotes && (
                  <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <MessageSquare size={14} />
                      Doctor Notes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDiagnosis.doctorNotes}
                    </p>
                  </div>
                )}

                {/* Consultation */}
                <div className="text-sm p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="font-medium">Doctor Consultation: </span>
                  <span
                    className={
                      selectedDiagnosis.consultationRecommended
                        ? "text-amber-600"
                        : "text-green-600"
                    }
                  >
                    {selectedDiagnosis.consultationRecommended
                      ? "Recommended"
                      : "Not required"}
                  </span>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground">
                  ⚠️ Preliminary AI analysis only. Always consult a qualified
                  medical professional.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

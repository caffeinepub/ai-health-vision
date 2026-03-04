import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Save,
  ShieldCheck,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DiagnosisRecord } from "../backend.d";
import { Severity } from "../backend.d";
import SeverityBadge from "../components/SeverityBadge";
import {
  useAllDiagnoses,
  useApproveDoctor,
  useApprovedDoctors,
  useDashboardStats,
  useIsCallerAdmin,
  useRejectDoctor,
  useUpdateDoctorNotes,
} from "../hooks/useQueries";
import { confidenceToPercent, formatDate, nsToDate } from "../utils/helpers";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        {icon}
      </div>
      <div className="font-display text-3xl font-bold text-foreground">
        {value}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function DashboardTab() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Patients"
        value={stats ? Number(stats.totalPatients) : 0}
        icon={<Users size={20} />}
        color="text-blue-600 bg-blue-50"
      />
      <StatCard
        label="Total Diagnoses"
        value={stats ? Number(stats.totalDiagnoses) : 0}
        icon={<Activity size={20} />}
        color="text-teal-600 bg-teal-50"
      />
      <StatCard
        label="Emergency Cases"
        value={stats ? Number(stats.emergencyCases) : 0}
        icon={<AlertTriangle size={20} />}
        color="text-red-600 bg-red-50"
      />
      <StatCard
        label="Pending Doctors"
        value={stats ? Number(stats.pendingDoctors) : 0}
        icon={<Clock size={20} />}
        color="text-amber-600 bg-amber-50"
      />
    </div>
  );
}

function CasesTab() {
  const { data: diagnoses = [], isLoading } = useAllDiagnoses(0n, 50n);
  const { mutateAsync: updateNotes, isPending } = useUpdateDoctorNotes();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [notesDialog, setNotesDialog] = useState<DiagnosisRecord | null>(null);
  const [notesText, setNotesText] = useState("");

  const filtered =
    severityFilter === "all"
      ? diagnoses
      : diagnoses.filter((d) => d.severity === severityFilter);

  const handleSaveNotes = async () => {
    if (!notesDialog) return;
    try {
      await updateNotes({ diagnosisId: notesDialog.id, notes: notesText });
      toast.success("Notes saved");
      setNotesDialog(null);
    } catch {
      toast.error("Failed to save notes");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="font-semibold text-foreground">All Cases</h3>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value={Severity.low}>Low</SelectItem>
            <SelectItem value={Severity.medium}>Medium</SelectItem>
            <SelectItem value={Severity.high}>High</SelectItem>
            <SelectItem value={Severity.emergency}>Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          <FileText size={32} className="mx-auto mb-3" />
          <p className="text-sm">No cases found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table data-ocid="admin.table">
            <TableHeader>
              <TableRow>
                <TableHead>Condition</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Emergency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d, idx) => (
                <TableRow key={d.id} data-ocid={`admin.item.${idx + 1}`}>
                  <TableCell className="font-medium">
                    {d.conditionName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(nsToDate(d.timestamp))}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={d.severity} />
                  </TableCell>
                  <TableCell>
                    {confidenceToPercent(d.confidenceScore)}%
                  </TableCell>
                  <TableCell>
                    {d.isEmergency ? (
                      <Badge variant="destructive" className="text-xs">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      data-ocid="admin.edit_button"
                      onClick={() => {
                        setNotesDialog(d);
                        setNotesText(d.doctorNotes || "");
                      }}
                    >
                      Add Notes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={!!notesDialog} onOpenChange={() => setNotesDialog(null)}>
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Add Doctor Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Condition:{" "}
              <span className="font-medium text-foreground">
                {notesDialog?.conditionName}
              </span>
            </p>
            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter clinical notes…"
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setNotesDialog(null)}
                className="flex-1"
                data-ocid="admin.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNotes}
                disabled={isPending}
                className="flex-1 gap-2 medical-gradient text-white border-0"
                data-ocid="admin.save_button"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DoctorsTab() {
  const { data: doctors = [], isLoading } = useApprovedDoctors();
  const { mutateAsync: approveDoctor, isPending: approving } =
    useApproveDoctor();
  const { mutateAsync: rejectDoctor, isPending: rejecting } = useRejectDoctor();

  const pendingDoctors = doctors.filter((d) => !d.approved);
  const approvedDoctors = doctors.filter((d) => d.approved);

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock size={16} />
          Pending Approvals ({pendingDoctors.length})
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : pendingDoctors.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground bg-card rounded-xl border border-border"
            data-ocid="admin.empty_state"
          >
            <CheckCircle size={28} className="mx-auto mb-2 text-green-500" />
            <p className="text-sm">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDoctors.map((doc, idx) => (
              <div
                key={doc.licenseNumber}
                className="bg-card rounded-xl border border-border p-4 flex items-start gap-4"
                data-ocid={`admin.item.${idx + 1}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.specialty} · License: {doc.licenseNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {doc.bio}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
                    disabled={approving}
                    data-ocid="admin.confirm_button"
                    onClick={() => {
                      approveDoctor(Principal.fromText("aaaaa-aa"));
                      toast.success(`${doc.name} approved`);
                    }}
                  >
                    <CheckCircle size={13} />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    disabled={rejecting}
                    data-ocid="admin.delete_button"
                    onClick={() => {
                      rejectDoctor(Principal.fromText("aaaaa-aa"));
                      toast.success(`${doc.name} rejected`);
                    }}
                  >
                    <XCircle size={13} />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved */}
      {approvedDoctors.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Approved Doctors ({approvedDoctors.length})
          </h3>
          <div className="space-y-3">
            {approvedDoctors.map((doc, idx) => (
              <div
                key={doc.licenseNumber}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
                data-ocid={`admin.item.${idx + 1}`}
              >
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                  <Stethoscope size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.specialty}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs text-green-600 bg-green-50 border-green-200"
                >
                  Approved
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();

  if (checkingAdmin) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto">
        <ShieldCheck size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          Access Restricted
        </h2>
        <p className="text-muted-foreground text-sm">
          You don't have admin privileges to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl medical-gradient flex items-center justify-center shadow-sm">
          <ShieldCheck size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor cases, manage doctors, and review AI predictions
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6" data-ocid="admin.tab">
            <TabsTrigger value="dashboard" className="gap-2">
              <Activity size={14} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <FileText size={14} />
              Cases
            </TabsTrigger>
            <TabsTrigger value="doctors" className="gap-2">
              <Stethoscope size={14} />
              Doctors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="cases">
            <CasesTab />
          </TabsContent>
          <TabsContent value="doctors">
            <DoctorsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

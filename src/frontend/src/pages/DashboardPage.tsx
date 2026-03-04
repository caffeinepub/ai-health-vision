import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  ClipboardList,
  ScanLine,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import SeverityBadge from "../components/SeverityBadge";
import {
  useCallerUserProfile,
  usePatientAppointments,
  usePatientDiagnoses,
} from "../hooks/useQueries";
import { confidenceToPercent, formatDate, nsToDate } from "../utils/helpers";

export default function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const { data: diagnoses = [], isLoading: diagnosesLoading } =
    usePatientDiagnoses(0n, 3n);
  const { data: appointments = [] } = usePatientAppointments(0n, 5n);

  const recentDiagnoses = [...diagnoses].slice(0, 3);
  const lastDiagnosis = recentDiagnoses[0];
  const emergencyCount = diagnoses.filter((d) => d.isEmergency).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {profileLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Good day
              {profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              How are you feeling today? Ready for a health check?
            </p>
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Analyses",
            value: diagnosesLoading ? "—" : diagnoses.length.toString(),
            icon: <Activity size={18} />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Last Analysis",
            value: lastDiagnosis
              ? formatDate(nsToDate(lastDiagnosis.timestamp))
              : "None yet",
            icon: <Calendar size={18} />,
            color: "text-teal-600 bg-teal-50",
          },
          {
            label: "Appointments",
            value: appointments.length.toString(),
            icon: <Stethoscope size={18} />,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Alerts",
            value: emergencyCount.toString(),
            icon: <AlertTriangle size={18} />,
            color:
              emergencyCount > 0
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-xl p-4 border border-border shadow-card"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div className="font-semibold text-base text-foreground leading-tight">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* New Analysis CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-shadow p-5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 medical-gradient opacity-10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl medical-gradient flex items-center justify-center mb-3 shadow-sm">
              <ScanLine size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
              New Analysis
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload or capture an image for AI medical analysis
            </p>
            <Link to="/analyze">
              <Button
                className="medical-gradient text-white border-0 gap-2 shadow-sm"
                data-ocid="dashboard.primary_button"
              >
                Start Analysis
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Book Doctor */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-shadow p-5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 opacity-10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center mb-3 shadow-sm">
              <Stethoscope size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
              Book a Doctor
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with certified healthcare professionals
            </p>
            <Link to="/doctors">
              <Button variant="outline" className="gap-2">
                Find Doctors
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Diagnoses */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">Recent Analyses</h2>
          </div>
          <Link
            to="/history"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {diagnosesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : recentDiagnoses.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <TrendingUp
              size={32}
              className="text-muted-foreground mx-auto mb-3"
            />
            <p className="text-muted-foreground font-medium">No analyses yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first image to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDiagnoses.map((diagnosis, idx) => (
              <Link
                key={diagnosis.id}
                to="/history"
                data-ocid={`dashboard.item.${idx + 1}`}
                className="block bg-card rounded-xl border border-border p-4 hover:shadow-card transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium text-foreground truncate">
                      {diagnosis.conditionName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(nsToDate(diagnosis.timestamp))} ·{" "}
                      {confidenceToPercent(diagnosis.confidenceScore)}%
                      confidence
                    </p>
                  </div>
                  <SeverityBadge severity={diagnosis.severity} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

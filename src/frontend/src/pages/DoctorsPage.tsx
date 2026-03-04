import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import {
  Calendar,
  Clock,
  Loader2,
  MessageSquare,
  Stethoscope,
  UserCircle,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DoctorProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useApprovedDoctors, useBookAppointment } from "../hooks/useQueries";

const MOCK_DOCTORS: DoctorProfile[] = [
  {
    name: "Dr. Sarah Mitchell",
    specialty: "Dermatology",
    bio: "Board-certified dermatologist with 12 years of experience in skin conditions, cosmetic dermatology, and skin cancer detection.",
    approved: true,
    licenseNumber: "DRM-2045-X",
    availableSlots: [],
  },
  {
    name: "Dr. James Okonkwo",
    specialty: "General Medicine",
    bio: "Primary care physician specializing in preventive medicine, chronic disease management, and acute care.",
    approved: true,
    licenseNumber: "GM-3312-Y",
    availableSlots: [],
  },
  {
    name: "Dr. Priya Sharma",
    specialty: "Infectious Disease",
    bio: "Specialist in bacterial, viral, and fungal infections. Expert in tropical medicine and antibiotic stewardship.",
    approved: true,
    licenseNumber: "ID-8871-Z",
    availableSlots: [],
  },
];

interface BookingModalProps {
  doctor: DoctorProfile | null;
  onClose: () => void;
}

function BookingModal({ doctor, onClose }: BookingModalProps) {
  const { identity } = useInternetIdentity();
  const { mutateAsync: bookAppointment, isPending } = useBookAppointment();
  const [dateTime, setDateTime] = useState("");
  const [reason, setReason] = useState("");

  const handleBook = async () => {
    if (!doctor || !identity || !dateTime) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      const dt = new Date(dateTime);
      const dtNs = BigInt(dt.getTime()) * 1_000_000n;

      await bookAppointment({
        doctorId: Principal.fromText("aaaaa-aa"),
        patientId: identity.getPrincipal(),
        dateTime: dtNs,
        reason,
      });

      toast.success("Appointment booked successfully!");
      onClose();
    } catch (err) {
      toast.error("Failed to book appointment. Please try again.");
      console.error(err);
    }
  };

  return (
    <Dialog open={!!doctor} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm" data-ocid="doctors.dialog">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule a consultation with {doctor?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Doctor info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle size={22} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">
                {doctor?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {doctor?.specialty}
              </p>
            </div>
          </div>

          {/* Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="datetime">
              Preferred Date & Time <span className="text-destructive">*</span>
            </Label>
            <input
              id="datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="doctors.input"
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your health concern…"
              rows={3}
              className="resize-none"
              data-ocid="doctors.textarea"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="doctors.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBook}
              disabled={isPending || !dateTime}
              className="flex-1 medical-gradient text-white border-0 gap-2"
              data-ocid="doctors.submit_button"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Calendar size={14} />
              )}
              {isPending ? "Booking…" : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DoctorCard({
  doctor,
  index,
  onBook,
}: {
  doctor: DoctorProfile;
  index: number;
  onBook: (doc: DoctorProfile) => void;
}) {
  const specialtyColors: Record<string, string> = {
    Dermatology: "text-rose-600 bg-rose-50",
    "General Medicine": "text-blue-600 bg-blue-50",
    "Infectious Disease": "text-teal-600 bg-teal-50",
  };
  const color =
    specialtyColors[doctor.specialty] || "text-purple-600 bg-purple-50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-5"
      data-ocid={`doctors.item.${index + 1}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Stethoscope size={22} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-foreground">{doctor.name}</h3>
              <Badge
                variant="secondary"
                className={`text-xs mt-1 ${color} border-0`}
              >
                {doctor.specialty}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              Available
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
            {doctor.bio}
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              size="sm"
              onClick={() => onBook(doctor)}
              className="gap-1.5 medical-gradient text-white border-0"
              data-ocid="doctors.open_modal_button"
            >
              <Calendar size={13} />
              Book Appointment
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DoctorsPage() {
  const { data: approvedDoctors = [], isLoading } = useApprovedDoctors();
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(
    null,
  );

  // Merge real + mock doctors
  const doctors = approvedDoctors.length > 0 ? approvedDoctors : MOCK_DOCTORS;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Doctor Connect
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Book appointments with certified healthcare professionals
        </p>
      </div>

      {/* Doctor List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor, idx) => (
            <DoctorCard
              key={doctor.licenseNumber || doctor.name}
              doctor={doctor}
              index={idx}
              onBook={setBookingDoctor}
            />
          ))}
        </div>
      )}

      {/* Coming Soon Section */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {/* Chat */}
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={22} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Chat with Doctor
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Real-time messaging with your doctor is coming soon.
          </p>
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        </div>

        {/* Video */}
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <Video size={22} className="text-teal-600" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Video Consultation
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Face-to-face video consultations with certified doctors.
          </p>
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        doctor={bookingDoctor}
        onClose={() => setBookingDoctor(null)}
      />
    </div>
  );
}

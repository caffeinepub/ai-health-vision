import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  ClipboardList,
  Clock,
  Loader2,
  Plus,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Gender } from "../backend.d";
import {
  useAddMedicalHistoryEntry,
  useCallerUserProfile,
  useMedicalHistory,
  usePatientAppointments,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import { formatDate, formatDateTime, nsToDate } from "../utils/helpers";

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault();
              onAdd(input.trim());
              setInput("");
            }
          }}
          placeholder={placeholder}
          data-ocid="profile.input"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            if (input.trim()) {
              onAdd(input.trim());
              setInput("");
            }
          }}
        >
          <Plus size={14} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 cursor-pointer text-xs"
              onClick={() => onRemove(tag)}
            >
              {tag}
              <X size={10} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  const { data: profile, isLoading } = useCallerUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: Gender.other as Gender,
    phone: "",
    bloodType: "",
    allergies: [] as string[],
    existingConditions: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        age: String(Number(profile.age)),
        gender: profile.gender,
        phone: profile.phone,
        bloodType: profile.bloodType || "",
        allergies: profile.allergies,
        existingConditions: profile.existingConditions,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile({
        name: form.name,
        age: BigInt(Number.parseInt(form.age, 10) || 0),
        gender: form.gender,
        phone: form.phone,
        bloodType: form.bloodType || undefined,
        allergies: form.allergies,
        existingConditions: form.existingConditions,
      });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Your full name"
          data-ocid="profile.input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Age</Label>
          <Input
            type="number"
            min="1"
            max="120"
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            placeholder="Age"
            data-ocid="profile.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={form.gender}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, gender: v as Gender }))
            }
          >
            <SelectTrigger data-ocid="profile.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.male}>Male</SelectItem>
              <SelectItem value={Gender.female}>Female</SelectItem>
              <SelectItem value={Gender.other}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+1 (555) 000-0000"
          data-ocid="profile.input"
        />
      </div>

      <div className="space-y-2">
        <Label>Blood Type (optional)</Label>
        <Select
          value={form.bloodType}
          onValueChange={(v) => setForm((p) => ({ ...p, bloodType: v }))}
        >
          <SelectTrigger data-ocid="profile.select">
            <SelectValue placeholder="Select blood type" />
          </SelectTrigger>
          <SelectContent>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
              <SelectItem key={bt} value={bt}>
                {bt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Known Allergies</Label>
        <TagInput
          tags={form.allergies}
          onAdd={(t) =>
            setForm((p) => ({ ...p, allergies: [...p.allergies, t] }))
          }
          onRemove={(t) =>
            setForm((p) => ({
              ...p,
              allergies: p.allergies.filter((a) => a !== t),
            }))
          }
          placeholder="Add allergy…"
        />
      </div>

      <div className="space-y-2">
        <Label>Existing Conditions</Label>
        <TagInput
          tags={form.existingConditions}
          onAdd={(t) =>
            setForm((p) => ({
              ...p,
              existingConditions: [...p.existingConditions, t],
            }))
          }
          onRemove={(t) =>
            setForm((p) => ({
              ...p,
              existingConditions: p.existingConditions.filter((c) => c !== t),
            }))
          }
          placeholder="Add condition…"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full medical-gradient text-white border-0 h-11 gap-2"
        data-ocid="profile.submit_button"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}

function MedicalHistoryTab() {
  const { data: history = [], isLoading } = useMedicalHistory();
  const { mutateAsync: addEntry, isPending } = useAddMedicalHistoryEntry();
  const [newNote, setNewNote] = useState("");

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    try {
      const now = BigInt(Date.now()) * 1_000_000n;
      await addEntry({ notes: newNote.trim(), timestamp: now });
      setNewNote("");
      toast.success("Note added to history");
    } catch {
      toast.error("Failed to add note");
    }
  };

  return (
    <div className="space-y-5">
      {/* Add Note */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border space-y-3">
        <h3 className="font-medium text-sm text-foreground">Add Health Note</h3>
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Describe a health event, symptom, or observation…"
          rows={3}
          className="resize-none"
          data-ocid="profile.textarea"
        />
        <Button
          onClick={handleAdd}
          disabled={isPending || !newNote.trim()}
          size="sm"
          className="gap-2 medical-gradient text-white border-0"
          data-ocid="profile.add_button"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add Note
        </Button>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <ClipboardList size={32} className="mx-auto mb-3" />
          <p className="text-sm">No history entries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...history]
            .sort((a, b) => Number(b.timestamp - a.timestamp))
            .map((entry) => (
              <div
                key={String(entry.timestamp)}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    {entry.notes}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />
                  {formatDateTime(nsToDate(entry.timestamp))}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function AppointmentsTab() {
  const { data: appointments = [], isLoading } = usePatientAppointments(
    0n,
    20n,
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Calendar size={32} className="mx-auto mb-3" />
        <p className="text-sm">No appointments scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <div
          key={String(apt.dateTime)}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Stethoscope size={16} className="text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {apt.reason || "Medical Appointment"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock size={10} />
                {formatDate(nsToDate(apt.dateTime))}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl medical-gradient flex items-center justify-center shadow-sm">
          <User size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your health information
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-card p-5"
      >
        <Tabs defaultValue="profile">
          <TabsList className="w-full mb-5" data-ocid="profile.tab">
            <TabsTrigger value="profile" className="flex-1 gap-2">
              <User size={14} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-2">
              <ClipboardList size={14} />
              Medical History
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex-1 gap-2">
              <Calendar size={14} />
              Appointments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="history">
            <MedicalHistoryTab />
          </TabsContent>
          <TabsContent value="appointments">
            <AppointmentsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

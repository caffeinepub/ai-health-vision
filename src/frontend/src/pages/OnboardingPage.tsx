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
import { useNavigate } from "@tanstack/react-router";
import { Heart, Loader2, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Gender } from "../backend.d";
import { useCreateOrUpdatePatientProfile } from "../hooks/useQueries";

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
  dataOcid,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
  dataOcid?: string;
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          data-ocid={dataOcid}
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
          <Plus size={16} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => onRemove(tag)}
            >
              {tag}
              <X size={12} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateOrUpdatePatientProfile();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: Gender.other as Gender,
    phone: "",
    bloodType: "",
    allergies: [] as string[],
    existingConditions: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await mutateAsync({
        info: {
          name: form.name,
          age: BigInt(Number.parseInt(form.age, 10)),
          gender: form.gender,
          phone: form.phone,
          bloodType: form.bloodType || undefined,
          allergies: form.allergies,
          existingConditions: form.existingConditions,
        },
        medicalHistory: [],
      });
      toast.success("Profile created successfully!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error("Failed to create profile. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-background p-4">
      <div className="max-w-lg mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center shadow-glow">
            <Heart size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Set Up Your Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Help us personalize your health experience
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-card p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Info */}
            <div className="space-y-1 mb-1">
              <h2 className="font-semibold text-foreground">
                Personal Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Basic details for your health profile
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Enter your full name"
                required
                data-ocid="onboarding.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">
                  Age <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, age: e.target.value }))
                  }
                  placeholder="Age"
                  required
                  data-ocid="onboarding.input"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, gender: v as Gender }))
                  }
                >
                  <SelectTrigger data-ocid="onboarding.select">
                    <SelectValue placeholder="Select gender" />
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
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+1 (555) 000-0000"
                required
                data-ocid="onboarding.input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type (optional)</Label>
              <Select
                value={form.bloodType}
                onValueChange={(v) => setForm((p) => ({ ...p, bloodType: v }))}
              >
                <SelectTrigger data-ocid="onboarding.select">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bt) => (
                      <SelectItem key={bt} value={bt}>
                        {bt}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <TagInput
              label="Known Allergies"
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
              placeholder="Type allergy and press Enter"
              dataOcid="onboarding.input"
            />

            <TagInput
              label="Existing Conditions"
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
                  existingConditions: p.existingConditions.filter(
                    (c) => c !== t,
                  ),
                }))
              }
              placeholder="e.g. Diabetes, Hypertension"
              dataOcid="onboarding.input"
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full medical-gradient text-white border-0 h-11 shadow-sm gap-2 mt-2"
              data-ocid="onboarding.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Profile…
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

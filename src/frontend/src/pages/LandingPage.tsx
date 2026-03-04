import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  Heart,
  ScanLine,
  ShieldCheck,
  Star,
  Stethoscope,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: <ScanLine size={24} />,
    title: "AI Medical Analysis",
    description:
      "Upload a photo or video of any health concern and receive instant AI-powered analysis with condition identification.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: <Zap size={24} />,
    title: "Instant Results",
    description:
      "Get preliminary diagnosis results in seconds, including confidence score, severity level, and treatment advice.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: <Stethoscope size={24} />,
    title: "Doctor Connect",
    description:
      "Book appointments with certified doctors, access video consultations, and get professional medical opinions.",
    color: "text-teal-600 bg-teal-50",
  },
];

const stats = [
  { value: "99.2%", label: "Analysis Accuracy" },
  { value: "< 10s", label: "Response Time" },
  { value: "50K+", label: "Patients Helped" },
  { value: "24/7", label: "AI Availability" },
];

const conditions = [
  "Skin Infections",
  "Wound Analysis",
  "Dental Issues",
  "Rashes & Dermatitis",
  "Swelling & Inflammation",
  "Fungal Infections",
  "Bruises & Injuries",
  "Allergic Reactions",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl medical-gradient flex items-center justify-center shadow-glow">
              <Heart size={18} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">
              AI Health Vision
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" data-ocid="landing.link">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/login" data-ocid="landing.primary_button">
              <Button
                size="sm"
                className="medical-gradient text-white border-0 shadow-sm"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-medical-bg.dim_1200x600.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-background/60 to-background" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Activity size={14} />
              AI-Powered Medical Vision Platform
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance mb-6">
              Your Personal
              <span className="block text-primary">AI Health Advisor</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              Capture or upload images of health concerns and receive instant
              AI-powered analysis, treatment suggestions, and doctor
              recommendations — from anywhere.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login" data-ocid="landing.primary_button">
                <Button
                  size="lg"
                  className="medical-gradient text-white border-0 shadow-glow gap-2 text-base px-8"
                >
                  Start Free Analysis
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login" data-ocid="landing.link">
                <Button size="lg" variant="outline" className="gap-2 text-base">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-4 shadow-card border border-border"
              >
                <div className="font-display text-2xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From AI analysis to doctor consultations — a complete healthcare
              companion in your pocket.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Conditions We Analyze
            </h2>
            <p className="text-muted-foreground">
              Our AI is trained on thousands of medical images across many
              conditions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {conditions.map((condition) => (
              <div
                key={condition}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-xs"
              >
                <CheckCircle size={14} className="text-primary" />
                {condition}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-card rounded-3xl p-10 border border-border shadow-card-hover relative overflow-hidden">
            <div className="absolute inset-0 medical-gradient opacity-5 rounded-3xl" />
            <ShieldCheck
              size={40}
              className="text-primary mx-auto mb-4 relative"
            />
            <h2 className="font-display text-3xl font-bold text-foreground mb-3 relative">
              Start Your Health Journey
            </h2>
            <p className="text-muted-foreground mb-8 relative">
              Join thousands of patients who trust AI Health Vision for
              preliminary health analysis. Always consult a doctor for
              professional diagnosis.
            </p>
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                4.9/5 from 10,000+ users
              </span>
            </div>
            <Link to="/login" data-ocid="landing.primary_button">
              <Button
                size="lg"
                className="medical-gradient text-white border-0 gap-2 shadow-glow"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg medical-gradient flex items-center justify-center">
              <Heart size={14} className="text-white" />
            </div>
            <span className="font-semibold text-foreground">
              AI Health Vision
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            For preliminary analysis only. Always consult a doctor.
          </p>
        </div>
      </footer>
    </div>
  );
}

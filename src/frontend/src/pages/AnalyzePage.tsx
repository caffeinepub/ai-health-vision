import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  BookmarkPlus,
  Camera,
  CheckCircle,
  FileText,
  FlipHorizontal,
  ImageIcon,
  Loader2,
  Pill,
  RotateCcw,
  ScanLine,
  Stethoscope,
  Upload,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { DiagnosticResult } from "../backend.d";
import { Severity } from "../backend.d";
import { useCamera } from "../camera/useCamera";
import EmergencyBanner from "../components/EmergencyBanner";
import SeverityBadge from "../components/SeverityBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAnalyze, useSubmitDiagnosis } from "../hooks/useQueries";
import {
  confidenceToPercent,
  fileToUint8Array,
  getConfidenceColor,
} from "../utils/helpers";

type AnalysisState = "idle" | "uploading" | "analyzing" | "results" | "error";

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  // Camera hook
  const {
    videoRef,
    canvasRef,
    isActive: cameraActive,
    isLoading: cameraLoading,
    error: cameraError,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  } = useCamera({ facingMode: "environment" });

  // State
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [savedDiagnosisId, setSavedDiagnosisId] = useState<string | null>(null);
  const [savedImageRef, setSavedImageRef] = useState<ExternalBlob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLLabelElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { mutateAsync: analyze } = useAnalyze();
  const { mutateAsync: submitDiagnosis } = useSubmitDiagnosis();

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "video/mp4", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use JPG, PNG, or MP4.");
      return;
    }
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setSavedDiagnosisId(null);
    setAnalysisState("idle");
  }, []);

  // Drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  // Capture photo from camera
  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      setCapturedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await stopCamera();
      setResult(null);
      setSavedDiagnosisId(null);
      setAnalysisState("idle");
    }
  };

  // Run analysis
  const handleAnalyze = async () => {
    const file = activeTab === "camera" ? capturedFile : uploadedFile;
    if (!file) {
      toast.error("Please capture or upload an image first");
      return;
    }

    try {
      setAnalysisState("uploading");
      setUploadProgress(0);

      // Convert file to bytes and upload
      const bytes = await fileToUint8Array(file);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );

      setAnalysisState("analyzing");
      const analysisResult = await analyze(blob);

      setSavedImageRef(blob);
      setResult(analysisResult);
      setAnalysisState("results");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.",
      );
      setAnalysisState("error");
      toast.error("Analysis failed");
    }
  };

  // Save to history
  const handleSave = async () => {
    if (!result || !savedImageRef || !identity) {
      toast.error("Cannot save — please analyze an image first.");
      return;
    }

    const id = crypto.randomUUID();
    const now = BigInt(Date.now()) * 1_000_000n;

    try {
      await submitDiagnosis({
        id,
        isEmergency: result.isEmergency,
        patientId: identity.getPrincipal(),
        conditionName: result.conditionName,
        treatmentAdvice: result.treatmentAdvice,
        confidenceScore: result.confidenceScore,
        consultationRecommended: result.consultationRecommended,
        imageRef: savedImageRef,
        timestamp: now,
        severity: result.severity,
        otcMedicines: result.otcMedicines,
      });

      setSavedDiagnosisId(id);
      toast.success("Analysis saved to history!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save analysis");
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setCapturedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setSavedDiagnosisId(null);
    setSavedImageRef(null);
    setAnalysisState("idle");
    setUploadProgress(0);
    setSymptoms("");
  };

  const isLoading =
    analysisState === "uploading" || analysisState === "analyzing";
  const currentFile = activeTab === "camera" ? capturedFile : uploadedFile;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          AI Analysis
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload or capture an image for preliminary medical analysis
        </p>
      </div>

      {/* Input Section */}
      {analysisState !== "results" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5 mb-4"
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              resetAnalysis();
            }}
          >
            <TabsList className="w-full mb-4" data-ocid="analyze.tab">
              <TabsTrigger value="upload" className="flex-1 gap-2">
                <Upload size={16} />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex-1 gap-2">
                <Camera size={16} />
                Camera
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload">
              {!previewUrl ? (
                <label
                  htmlFor="file-upload"
                  ref={dropZoneRef as React.RefObject<HTMLLabelElement>}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all block",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50",
                  )}
                  data-ocid="analyze.dropzone"
                >
                  <ImageIcon
                    size={36}
                    className="mx-auto mb-3 text-muted-foreground"
                  />
                  <p className="font-medium text-foreground mb-1">
                    Drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    JPG, PNG, MP4 accepted
                  </p>
                  <span
                    className="inline-flex items-center gap-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 py-1.5 rounded-md"
                    data-ocid="analyze.upload_button"
                  >
                    <Upload size={14} />
                    Browse Files
                  </span>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,video/mp4,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-secondary/20 border border-border">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    onClick={resetAnalysis}
                    className="absolute top-2 right-2 bg-card rounded-full p-1.5 shadow-sm border border-border hover:bg-secondary transition-colors"
                  >
                    <XCircle size={16} className="text-muted-foreground" />
                  </button>
                </div>
              )}
            </TabsContent>

            {/* Camera Tab */}
            <TabsContent value="camera">
              {capturedFile && previewUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-secondary/20 border border-border">
                    <img
                      src={previewUrl}
                      alt="Captured"
                      className="w-full max-h-64 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-card rounded-full p-1.5 shadow-sm border border-border"
                    >
                      <XCircle size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCapturedFile(null);
                      setPreviewUrl(null);
                      startCamera();
                    }}
                    className="w-full gap-2"
                  >
                    <RotateCcw size={14} />
                    Retake Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cameraActive ? (
                    <div className="relative rounded-xl overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-h-64 object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                        <Button
                          onClick={handleCapture}
                          className="rounded-full w-14 h-14 medical-gradient text-white border-4 border-white shadow-lg"
                        >
                          <Camera size={20} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full bg-white/80"
                          onClick={() => switchCamera()}
                        >
                          <FlipHorizontal size={16} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-xl p-10 text-center border-border">
                      <Camera
                        size={36}
                        className="mx-auto mb-3 text-muted-foreground"
                      />
                      <p className="font-medium text-foreground mb-1">
                        Camera Preview
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {cameraError
                          ? cameraError.message
                          : "Click to start camera"}
                      </p>
                      <Button
                        onClick={() => startCamera()}
                        disabled={cameraLoading}
                        className="gap-2 medical-gradient text-white border-0"
                      >
                        {cameraLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Camera size={14} />
                        )}
                        {cameraLoading ? "Starting…" : "Start Camera"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Symptoms textarea */}
          {(currentFile || capturedFile) && !isLoading && (
            <div className="mt-4 space-y-2">
              <label
                htmlFor="symptoms-textarea"
                className="text-sm font-medium text-foreground"
              >
                Describe your symptoms (optional)
              </label>
              <Textarea
                id="symptoms-textarea"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Redness and swelling on my left arm for 3 days…"
                rows={3}
                className="resize-none"
                data-ocid="analyze.textarea"
              />
            </div>
          )}

          {/* Analyze Button */}
          {(currentFile || capturedFile) && !isLoading && (
            <div className="mt-4">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full h-11 medical-gradient text-white border-0 gap-2 shadow-sm"
                data-ocid="analyze.submit_button"
              >
                <ScanLine size={18} />
                Analyze Now
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-card rounded-2xl border border-border shadow-card p-8 text-center"
            data-ocid="analyze.loading_state"
          >
            <div className="w-16 h-16 rounded-full medical-gradient flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ScanLine size={28} className="text-white" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
              {analysisState === "uploading"
                ? "Uploading Image…"
                : "Analyzing your image…"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {analysisState === "uploading"
                ? "Uploading to secure servers"
                : "Our AI is examining the image for medical insights"}
            </p>
            {analysisState === "uploading" && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {uploadProgress}%
                </p>
              </div>
            )}
            {analysisState === "analyzing" && (
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {analysisState === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          data-ocid="analyze.error_state"
        >
          <XCircle size={32} className="text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-red-700">Analysis Failed</h3>
          <p className="text-sm text-red-600 mt-1 mb-4">{errorMessage}</p>
          <Button variant="outline" onClick={resetAnalysis} className="gap-2">
            <RotateCcw size={14} />
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {analysisState === "results" && result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            data-ocid="analyze.success_state"
          >
            {/* Emergency Banner */}
            {result.isEmergency && <EmergencyBanner />}

            {/* Results Card */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              {/* Condition Header */}
              <div className="medical-gradient p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                      Detected Condition
                    </p>
                    <h2 className="font-display text-2xl font-bold text-white leading-tight">
                      {result.conditionName}
                    </h2>
                  </div>
                  <SeverityBadge
                    severity={result.severity}
                    className="bg-white/20 border-white/30 text-white shrink-0"
                  />
                </div>
                {/* Confidence Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/70 text-xs">
                      Confidence Score
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold px-2 py-0.5 rounded-full border text-xs",
                        getConfidenceColor(
                          confidenceToPercent(result.confidenceScore),
                        ),
                      )}
                    >
                      {confidenceToPercent(result.confidenceScore)}%
                    </span>
                  </div>
                  <Progress
                    value={confidenceToPercent(result.confidenceScore)}
                    className="h-2 bg-white/20"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-5">
                {/* Treatment Advice */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Stethoscope size={14} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">
                      Treatment Advice
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                    {result.treatmentAdvice}
                  </p>
                </div>

                {/* OTC Medicines */}
                {result.otcMedicines.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Pill size={14} className="text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">
                        Suggested OTC Medicines
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-9">
                      {result.otcMedicines.map((med) => (
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

                {/* Consultation Recommendation */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                  {result.consultationRecommended ? (
                    <CheckCircle
                      size={18}
                      className="text-amber-600 shrink-0"
                    />
                  ) : (
                    <CheckCircle
                      size={18}
                      className="text-green-600 shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Doctor Consultation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.consultationRecommended
                        ? "Recommended — please schedule an appointment with a doctor"
                        : "Not immediately required for this condition"}
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 border border-border">
                  ⚠️ This is a preliminary AI analysis only. Always consult a
                  qualified medical professional for diagnosis and treatment.
                </p>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={!!savedDiagnosisId}
                  variant="outline"
                  className="flex-1 gap-2"
                  data-ocid="analyze.primary_button"
                >
                  <BookmarkPlus size={16} />
                  {savedDiagnosisId ? "Saved!" : "Save to History"}
                </Button>
                {savedDiagnosisId && (
                  <Button
                    onClick={() =>
                      navigate({ to: `/report/${savedDiagnosisId}` })
                    }
                    className="flex-1 gap-2 medical-gradient text-white border-0"
                    data-ocid="analyze.primary_button"
                  >
                    <FileText size={16} />
                    Generate Report
                  </Button>
                )}
              </div>
            </div>

            {/* New Analysis */}
            <Button
              variant="outline"
              onClick={resetAnalysis}
              className="w-full gap-2"
            >
              <RotateCcw size={16} />
              New Analysis
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

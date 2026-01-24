import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Pill,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Bell,
  Check,
  Volume2,
  ImageIcon,
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import medicationsApi, { MedicationResponse, MedicationRequest } from "@/api/medications";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  times: string[];
  reminder: boolean;
  startDate: string;
  endDate?: string;
  instructions?: string;
}

const TIME_OPTIONS = [
  { id: "morning", label: "아침", icon: Sunrise, time: "08:00" },
  { id: "noon", label: "점심", icon: Sun, time: "12:00" },
  { id: "evening", label: "저녁", icon: Sunset, time: "18:00" },
  { id: "night", label: "취침전", icon: Moon, time: "22:00" },
];

// API 응답을 로컬 형식으로 변환
const mapToLocal = (response: MedicationResponse): Medication => ({
  id: response.id,
  name: response.name,
  dosage: response.dosage || "",
  times: response.times || [],
  reminder: response.reminder,
  startDate: response.startDate || new Date().toISOString().split('T')[0],
  endDate: response.endDate || undefined,
  instructions: response.instructions || undefined,
});

const SeniorMedication = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOCRResult, setShowOCRResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<Partial<Medication> | null>(null);

  // New medication form states
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTimes, setNewMedTimes] = useState<string[]>([]);
  const [newMedInstructions, setNewMedInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const data = await medicationsApi.getMyMedications();
        setMedications(data.map(mapToLocal));
      } catch (error) {
        console.error("복약 목록 로드 실패:", error);
        // 로그인되지 않은 경우 빈 목록 유지
        setMedications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();
  }, []);

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        processImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    setIsProcessing(true);
    toast.info("약봉투를 분석하고 있어요...");

    // TODO: 실제 OCR API 연동
    // 현재는 Mock 데이터로 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Mock OCR result - simulating extracted medication info
    const mockOcrResult: Partial<Medication> = {
      name: "고혈압약 (로사르탄)",
      dosage: "50mg 1정",
      times: ["morning", "evening"],
      instructions: "식후 복용, 자몽주스와 함께 복용 금지",
    };

    setOcrResult(mockOcrResult);
    setIsProcessing(false);
    setShowOCRResult(true);
    toast.success("약 정보를 읽었어요!");
  };

  const confirmOCRResult = async () => {
    if (ocrResult) {
      try {
        setSubmitting(true);
        const request: MedicationRequest = {
          medicationName: ocrResult.name || "새 약",
          dosageText: ocrResult.dosage,
          times: ocrResult.times || ["morning"],
          instructions: ocrResult.instructions,
        };

        const response = await medicationsApi.createMedication(request);
        setMedications([...medications, mapToLocal(response)]);
        toast.success("복약 일정이 등록되었어요!");
      } catch (error) {
        console.error("복약 등록 실패:", error);
        toast.error("등록에 실패했습니다.");
      } finally {
        setSubmitting(false);
      }
    }
    resetCapture();
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setShowOCRResult(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleTime = (timeId: string) => {
    setNewMedTimes(prev =>
      prev.includes(timeId)
        ? prev.filter(t => t !== timeId)
        : [...prev, timeId]
    );
  };

  const handleAddMedication = async () => {
    if (!newMedName.trim()) {
      toast.error("약 이름을 입력해주세요");
      return;
    }
    if (newMedTimes.length === 0) {
      toast.error("복용 시간을 선택해주세요");
      return;
    }

    try {
      setSubmitting(true);
      const request: MedicationRequest = {
        medicationName: newMedName,
        dosageText: newMedDosage,
        times: newMedTimes,
        instructions: newMedInstructions,
      };

      const response = await medicationsApi.createMedication(request);
      setMedications([...medications, mapToLocal(response)]);
      resetForm();
      setShowAddDialog(false);
      toast.success("복약 일정이 등록되었어요!");
    } catch (error) {
      console.error("복약 등록 실패:", error);
      toast.error("등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewMedName("");
    setNewMedDosage("");
    setNewMedTimes([]);
    setNewMedInstructions("");
  };

  const deleteMedication = async (id: number) => {
    try {
      await medicationsApi.deleteMedication(id);
      setMedications(medications.filter(m => m.id !== id));
      toast.success("복약 일정이 삭제되었어요");
    } catch (error) {
      console.error("삭제 실패:", error);
      toast.error("삭제에 실패했습니다.");
    }
  };

  const toggleReminder = async (id: number) => {
    try {
      const response = await medicationsApi.toggleReminder(id);
      setMedications(medications.map(m =>
        m.id === id ? { ...m, reminder: response.reminder } : m
      ));
    } catch (error) {
      console.error("알림 토글 실패:", error);
      toast.error("설정 변경에 실패했습니다.");
    }
  };

  const getTimeLabel = (timeId: string) => {
    return TIME_OPTIONS.find(t => t.id === timeId)?.label || timeId;
  };

  const speakMedication = (med: Medication) => {
    const timeLabels = med.times.map(t => getTimeLabel(t)).join(", ");
    const text = `${med.name}, ${med.dosage}, ${timeLabels}에 복용하세요. ${med.instructions || ""}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-success" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <header className="bg-success text-success-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/senior")}
            className="text-success-foreground hover:bg-success-foreground/20 p-3"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-foreground/20 flex items-center justify-center">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">복약 일정</h1>
              <p className="text-success-foreground/80 text-sm">약 복용 시간을 알려드려요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Camera Capture Section */}
        <Card className="border-2 border-dashed border-success/30">
          <CardContent className="p-6">
            {!capturedImage && !isProcessing ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-success" />
                </div>
                <div>
                  <p className="text-lg font-bold mb-1">약봉투를 촬영해주세요</p>
                  <p className="text-muted-foreground text-sm">
                    약봉투를 카메라로 찍으면<br />
                    복약 일정을 자동으로 등록해드려요
                  </p>
                </div>
                <Button
                  onClick={handleCameraCapture}
                  className="w-full h-16 text-lg font-bold rounded-2xl gap-3 bg-success hover:bg-success/90"
                  size="lg"
                >
                  <Camera className="w-7 h-7" />
                  약봉투 촬영하기
                </Button>
              </div>
            ) : isProcessing ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center animate-pulse">
                  <ImageIcon className="w-10 h-10 text-success" />
                </div>
                <div>
                  <p className="text-lg font-bold">분석 중이에요...</p>
                  <p className="text-muted-foreground">잠시만 기다려주세요</p>
                </div>
              </div>
            ) : capturedImage && showOCRResult && ocrResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl">
                  <Check className="w-8 h-8 text-success" />
                  <div>
                    <p className="font-bold text-lg">약 정보를 읽었어요!</p>
                    <p className="text-muted-foreground text-sm">아래 내용을 확인해주세요</p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-xl space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-sm">약 이름</Label>
                    <p className="text-lg font-bold">{ocrResult.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">복용량</Label>
                    <p className="font-medium">{ocrResult.dosage}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">복용 시간</Label>
                    <div className="flex gap-2 mt-1">
                      {ocrResult.times?.map(t => (
                        <Badge key={t} variant="secondary" className="text-sm py-1 px-3">
                          {getTimeLabel(t)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {ocrResult.instructions && (
                    <div>
                      <Label className="text-muted-foreground text-sm">복용 방법</Label>
                      <p className="text-sm">{ocrResult.instructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={resetCapture}
                    className="flex-1 h-14 text-lg rounded-xl"
                  >
                    다시 찍기
                  </Button>
                  <Button
                    onClick={confirmOCRResult}
                    disabled={submitting}
                    className="flex-1 h-14 text-lg rounded-xl bg-success hover:bg-success/90"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    등록하기
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* My Medications List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-success" />
              내 복약 목록
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              직접 추가
            </Button>
          </div>

          <div className="space-y-4">
            {medications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    등록된 복약 일정이 없어요<br />
                    약봉투를 촬영하거나 직접 추가해주세요
                  </p>
                </CardContent>
              </Card>
            ) : (
              medications.map((med) => (
                <Card key={med.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className="w-5 h-5 text-success" />
                          {med.name}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">{med.dosage}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => speakMedication(med)}
                        className="text-muted-foreground hover:text-success"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {/* Time badges */}
                    <div className="flex flex-wrap gap-2">
                      {med.times.map((time) => {
                        const timeOption = TIME_OPTIONS.find(t => t.id === time);
                        const Icon = timeOption?.icon || Clock;
                        return (
                          <Badge
                            key={time}
                            variant="secondary"
                            className="py-2 px-4 text-sm gap-2"
                          >
                            <Icon className="w-4 h-4" />
                            {timeOption?.label} ({timeOption?.time})
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Instructions */}
                    {med.instructions && (
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        💊 {med.instructions}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <Bell className={`w-5 h-5 ${med.reminder ? "text-success" : "text-muted-foreground"}`} />
                        <span className="text-sm">알림</span>
                        <Switch
                          checked={med.reminder}
                          onCheckedChange={() => toggleReminder(med.id)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMedication(med.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add Medication Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="w-6 h-6 text-success" />
              복약 일정 추가
            </DialogTitle>
            <DialogDescription>
              약 정보를 직접 입력해주세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">약 이름 *</Label>
              <Input
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="예: 혈압약"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">복용량</Label>
              <Input
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder="예: 1정"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">복용 시간 *</Label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = newMedTimes.includes(option.id);
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleTime(option.id)}
                      className={`h-16 flex-col gap-1 ${isSelected ? "bg-success hover:bg-success/90" : ""}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{option.label}</span>
                      <span className="text-xs opacity-70">{option.time}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">복용 방법</Label>
              <Input
                value={newMedInstructions}
                onChange={(e) => setNewMedInstructions(e.target.value)}
                placeholder="예: 식후 30분"
                className="h-12 text-lg"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAddDialog(false);
              }}
              className="flex-1 h-12"
            >
              취소
            </Button>
            <Button
              onClick={handleAddMedication}
              disabled={submitting}
              className="flex-1 h-12 bg-success hover:bg-success/90"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Emergency Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={() => navigate("/senior")}
          variant="outline"
          className="w-full h-16 text-lg font-bold rounded-2xl"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default SeniorMedication;

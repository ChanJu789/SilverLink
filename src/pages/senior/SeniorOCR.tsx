import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import {
  Heart,
  ArrowLeft,
  Camera,
  Upload,
  Volume2,
  RotateCcw,
  FileText,
  Loader2,
  Pill,
  Plus,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ocrApi from "@/api/ocr";
import medicationsApi, { MedicationRequest } from "@/api/medications";
import { getErrorMessage } from "@/utils/errorUtils";

const SeniorOCR = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 복약 등록 관련
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [extractedMedications, setExtractedMedications] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<Set<string>>(new Set());
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set(["morning", "evening"]));
  const [isRegistering, setIsRegistering] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.info("이미지 최적화 중...");

      // 압축 옵션 설정
      const options = {
        maxSizeMB: 1,          // 1MB 이하로 압축 (WAF/Spring 제한 통과)
        maxWidthOrHeight: 1920, // FHD 수준 리사이징 (OCR 인식률 최적)
        useWebWorker: true,     // 메인 스레드 멈춤 방지
        fileType: 'image/jpeg'  // 호환성 좋은 포맷으로 변환
      };

      // 라이브러리가 압축 및 EXIF 회전 보정을 자동 수행
      const compressedFile = await imageCompression(file, options);
      
      console.log(`📸 압축 완료: ${(file.size/1024/1024).toFixed(2)}MB -> ${(compressedFile.size/1024/1024).toFixed(2)}MB`);

      setSelectedFile(compressedFile);
      
      // 압축된 파일로 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
      
      // 압축된 파일로 OCR 처리
      processImage(compressedFile);
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      toast.error("사진을 처리하는 데 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setExtractedText("");

    try {
      const result = await ocrApi.analyzeDocument(file);

      if (result.text) {
        // 원본 텍스트 그대로 표시
        setExtractedText(result.text);
        toast.success("문서를 읽었어요!");

        // 약 이름 추출 시도
        const medications = extractMedicationNames(result.text);
        if (medications.length > 0) {
          setExtractedMedications(medications);
        }
      } else {
        setExtractedText("문서에서 텍스트를 찾을 수 없었어요.");
        toast.warning("문서 인식이 어려워요. 다시 찍어보세요.");
      }
    } catch (error: any) {
      console.error("OCR 처리 실패:", error);
      
      // 타임아웃 에러 처리
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error("처리 시간이 너무 오래 걸려요. 더 밝은 곳에서 다시 찍어보세요.");
      } else {
        toast.error(getErrorMessage(error, "문서를 읽는데 실패했어요."));
      }
      setExtractedText("");
    } finally {
      setIsProcessing(false);
    }
  };

  // OCR 텍스트 정제 함수
  const cleanOCRText = (text: string): string => {
    if (!text) return "";

    const lines = text.split('\n');
    const cleanedLines: string[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      // 마크다운 리스트 기호 제거
      line = line.replace(/^[-*+]\s+/, '');
      
      // 불필요한 메타데이터 라인 필터링
      const skipPatterns = [
        /^환자정보/i,
        /^교부번호/i,
        /^병원정보/i,
        /^조제\s*약사/i,
        /^처방\s*의사/i,
        /^처방\s*일자/i,
        /^조제\s*일자/i,
        /^약국\s*명/i,
        /^약국\s*주소/i,
        /^약국\s*전화/i,
        /^약품사진/i,
        /^약품명/i,
        /^복약안내/i,
        /^주의사항/i,
        /^투약량/i,
        /^투여수/i,
        /^투여시간/i,
        /^\d{4}-\d{2}-\d{2}$/,
        /^만\d+세/,
        /^\(.*\)$/,
      ];
      
      if (skipPatterns.some(pattern => pattern.test(line))) {
        continue;
      }
      
      // 콜론이 포함된 라벨 라인 건너뛰기
      if (/^[가-힣\s]+:\s*$/.test(line) || /^[가-힣\s]+:$/.test(line)) {
        continue;
      }
      
      // 너무 짧은 라인 건너뛰기
      if (line.length < 2) {
        continue;
      }
      
      cleanedLines.push(line);
    }

    return cleanedLines.join('\n');
  };

  // 약 이름 추출 (간단한 패턴 매칭)
  const extractMedicationNames = (text: string): string[] => {
    const medications: string[] = [];
    
    // 먼저 텍스트 정제
    const cleanedText = cleanOCRText(text);

    // 일반적인 약 이름 패턴 (한글, 영문+숫자)
    const patterns = [
      /([가-힣a-zA-Z]+(?:정|캡슐|시럽|액|크림|연고|주사))/g,
      /([가-힣]{2,}약)/g,
      /([a-zA-Z]+\s*\d+(?:mg|ml|mcg)?)/gi,
    ];

    patterns.forEach(pattern => {
      const matches = cleanedText.match(pattern);
      if (matches) {
        matches.forEach(m => {
          const cleaned = m.trim();
          if (cleaned.length >= 2 && !medications.includes(cleaned)) {
            medications.push(cleaned);
          }
        });
      }
    });

    // 최대 5개까지만
    return medications.slice(0, 5);
  };

  // 약 이름을 쉬운 표현으로 변환
  const getMedicationCategory = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("혈압") || lower.includes("amlod") || lower.includes("losar")) return "혈압약";
    if (lower.includes("당뇨") || lower.includes("metfor") || lower.includes("glim")) return "당뇨약";
    if (lower.includes("감기") || lower.includes("타이레놀") || lower.includes("acetam")) return "감기약";
    if (lower.includes("위") || lower.includes("omep") || lower.includes("panto")) return "위장약";
    if (lower.includes("진통") || lower.includes("ibup") || lower.includes("aspir")) return "진통제";
    if (lower.includes("수면") || lower.includes("zolp")) return "수면제";
    if (lower.includes("비타민") || lower.includes("vitam")) return "비타민";
    return name;
  };

  const handleSpeak = () => {
    if (!extractedText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // 텍스트 정제 후 읽기
    const textToSpeak = cleanOCRText(extractedText) || extractedText;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setImage(null);
    setExtractedText("");
    setIsSpeaking(false);
    setExtractedMedications([]);
    setSelectedMedications(new Set());
  };

  const handleOpenMedicationDialog = () => {
    setSelectedMedications(new Set(extractedMedications));
    setShowMedicationDialog(true);
  };

  const handleToggleMedication = (med: string) => {
    const newSet = new Set(selectedMedications);
    if (newSet.has(med)) {
      newSet.delete(med);
    } else {
      newSet.add(med);
    }
    setSelectedMedications(newSet);
  };

  const handleToggleTime = (time: string) => {
    const newSet = new Set(selectedTimes);
    if (newSet.has(time)) {
      newSet.delete(time);
    } else {
      newSet.add(time);
    }
    setSelectedTimes(newSet);
  };

  const handleRegisterMedications = async () => {
    if (selectedMedications.size === 0) {
      toast.error("등록할 약을 선택해주세요.");
      return;
    }

    if (selectedTimes.size === 0) {
      toast.error("복용 시간을 선택해주세요.");
      return;
    }

    setIsRegistering(true);
    let successCount = 0;

    try {
      for (const med of selectedMedications) {
        const request: MedicationRequest = {
          medicationName: getMedicationCategory(med),
          times: Array.from(selectedTimes),
          reminder: true,
        };

        console.log("복약 등록 요청:", request);
        await medicationsApi.createMedication(request);
        successCount++;
      }

      toast.success(`${successCount}개 약이 등록되었어요!`);
      setShowMedicationDialog(false);
      navigate("/senior/medication");
    } catch (error: any) {
      console.error("Failed to register medications:", error);
      console.error("에러 응답:", error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || "약 등록에 실패했어요. 다시 시도해주세요.";
      
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const timeLabels: Record<string, string> = {
    morning: "아침",
    noon: "점심",
    evening: "저녁",
    night: "자기 전",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-info text-info-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/senior")}
            className="text-info-foreground hover:bg-info-foreground/20 p-3"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-info-foreground/20 flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">약봉지 읽기</h1>
              <p className="text-info-foreground/80 text-sm">약봉지를 찍으면 일정에 등록해요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Camera/Upload Section */}
        {!image && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-info/10 flex items-center justify-center">
                  <Pill className="w-12 h-12 text-info" />
                </div>
                <div>
                  <p className="text-xl font-bold mb-2">약봉지를 촬영해주세요</p>
                  <p className="text-muted-foreground">
                    약봉지를 찍으면 자동으로 일정에 등록해드려요.
                  </p>
                </div>
                <div className="space-y-4">
                  <Button
                    onClick={handleCameraCapture}
                    className="w-full h-20 text-xl font-bold rounded-2xl gap-3"
                    size="lg"
                  >
                    <Camera className="w-8 h-8" />
                    카메라로 찍기
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCameraCapture}
                    className="w-full h-16 text-lg font-bold rounded-2xl gap-3"
                    size="lg"
                  >
                    <Upload className="w-6 h-6" />
                    사진 선택하기
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <Loader2 className="w-16 h-16 mx-auto text-info animate-spin" />
                <div>
                  <p className="text-xl font-bold">약봉지를 읽고 있어요...</p>
                  <p className="text-muted-foreground mt-2">잠시만 기다려주세요</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Section */}
        {image && extractedText && !isProcessing && (
          <div className="space-y-6">
            {/* Image Preview */}
            <Card>
              <CardContent className="p-4">
                <img
                  src={image}
                  alt="촬영한 약봉지"
                  className="w-full rounded-xl"
                />
              </CardContent>
            </Card>

            {/* Extracted Medications */}
            {extractedMedications.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Pill className="w-6 h-6 text-primary" />
                    <span className="text-lg font-bold">찾은 약</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {extractedMedications.map((med, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {getMedicationCategory(med)}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={handleOpenMedicationDialog}
                    className="w-full h-16 text-lg font-bold rounded-2xl gap-3"
                    size="lg"
                  >
                    <Plus className="w-6 h-6" />
                    복약 일정에 등록하기
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Extracted Text */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-info" />
                  <span className="text-lg font-bold">읽은 내용</span>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 whitespace-pre-wrap text-lg leading-relaxed max-h-48 overflow-y-auto">
                  {extractedText}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleSpeak}
                className={`w-full h-20 text-xl font-bold rounded-2xl gap-3 ${isSpeaking ? "bg-warning hover:bg-warning/90" : ""
                  }`}
                size="lg"
              >
                <Volume2 className="w-8 h-8" />
                {isSpeaking ? "읽기 중지" : "소리로 읽어주기"}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full h-16 text-lg font-bold rounded-2xl gap-3"
                size="lg"
              >
                <RotateCcw className="w-6 h-6" />
                다시 찍기
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!image && (
          <Card className="bg-info/5 border-info/20">
            <CardContent className="p-6">
              <p className="font-bold mb-3 text-info">💡 잘 찍는 방법</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 밝은 곳에서 찍어주세요</li>
                <li>• 약봉지가 화면에 꽉 차게 찍어주세요</li>
                <li>• 글씨가 잘 보이게 찍어주세요</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Medication Registration Dialog */}
      <Dialog open={showMedicationDialog} onOpenChange={setShowMedicationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">복약 일정 등록</DialogTitle>
            <DialogDescription>
              등록할 약과 복용 시간을 선택해주세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 약 선택 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">💊 등록할 약</Label>
              <div className="grid grid-cols-2 gap-2">
                {extractedMedications.map((med) => (
                  <div
                    key={med}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${selectedMedications.has(med)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                      }`}
                    onClick={() => handleToggleMedication(med)}
                  >
                    <Checkbox checked={selectedMedications.has(med)} />
                    <span className="text-sm font-medium">
                      {getMedicationCategory(med)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">⏰ 복용 시간</Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(timeLabels).map(([key, label]) => (
                  <div
                    key={key}
                    className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedTimes.has(key)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                      }`}
                    onClick={() => handleToggleTime(key)}
                  >
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMedicationDialog(false)}
              disabled={isRegistering}
            >
              취소
            </Button>
            <Button
              onClick={handleRegisterMedications}
              disabled={isRegistering || selectedMedications.size === 0}
              className="gap-2"
            >
              {isRegistering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeniorOCR;


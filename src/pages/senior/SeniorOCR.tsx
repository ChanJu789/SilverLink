import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Heart,
  ArrowLeft,
  Camera,
  Upload,
  Volume2,
  RotateCcw,
  FileText,
  Loader2
} from "lucide-react";

const SeniorOCR = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        processImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processImage = async () => {
    setIsProcessing(true);
    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock extracted text
    const mockText = `[추출된 문서 내용]

안녕하세요, 어르신.

이 문서는 2024년 1월 건강검진 결과입니다.

혈압: 정상 (120/80)
혈당: 정상 (95mg/dL)
콜레스테롤: 약간 높음 (210mg/dL)

다음 건강검진 예정일: 2024년 7월 15일

문의사항이 있으시면 담당 상담사에게 연락해주세요.

감사합니다.
마음돌봄 건강관리팀`;

    setExtractedText(mockText);
    setIsProcessing(false);
    toast.success("문서를 읽었어요!");
  };

  const handleSpeak = () => {
    if (!extractedText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(extractedText);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setImage(null);
    setExtractedText("");
    setIsSpeaking(false);
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
              <h1 className="text-2xl font-bold">문서 읽기</h1>
              <p className="text-info-foreground/80 text-sm">카메라로 문서를 읽어드려요</p>
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
                  <Camera className="w-12 h-12 text-info" />
                </div>
                <div>
                  <p className="text-xl font-bold mb-2">문서를 촬영해주세요</p>
                  <p className="text-muted-foreground">
                    읽고 싶은 문서를 카메라로 찍어주세요.<br />
                    글자를 읽어드릴게요.
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
                  <p className="text-xl font-bold">문서를 읽고 있어요...</p>
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
                  alt="촬영한 문서"
                  className="w-full rounded-xl"
                />
              </CardContent>
            </Card>

            {/* Extracted Text */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-info" />
                  <span className="text-lg font-bold">읽은 내용</span>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 whitespace-pre-wrap text-lg leading-relaxed">
                  {extractedText}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleSpeak}
                className={`w-full h-20 text-xl font-bold rounded-2xl gap-3 ${
                  isSpeaking ? "bg-warning hover:bg-warning/90" : ""
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
                <li>• 문서가 화면에 꽉 차게 찍어주세요</li>
                <li>• 손이 떨리지 않게 잡아주세요</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SeniorOCR;

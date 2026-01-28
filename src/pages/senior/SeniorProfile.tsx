import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Heart,
  User,
  Phone,
  ArrowLeft,
} from "lucide-react";

const SeniorProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12"
            onClick={() => navigate("/senior")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Heart className="w-7 h-7 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">내 정보</h1>
              <p className="text-sm sm:text-base text-muted-foreground">계정 설정</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="w-full max-w-2xl mx-auto space-y-5">
          {/* Profile Info Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">프로필 정보</CardTitle>
                  <CardDescription className="text-base">
                    내 계정 정보를 확인하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">이름</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-lg">어르신</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  휴대폰 번호
                </Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-lg">010-****-****</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SeniorProfile;

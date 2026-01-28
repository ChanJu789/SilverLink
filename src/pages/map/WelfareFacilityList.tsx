
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { mapApi } from "@/api/map";
import { WelfareFacilityResponse } from "@/types/api";

const FACILITY_TYPE_LABELS: Record<string, string> = {
    ELDERLY_WELFARE_CENTER: "노인복지관",
    DISABLED_WELFARE_CENTER: "장애인복지관",
    CHILD_WELFARE_CENTER: "아동복지관",
    COMMUNITY_WELFARE_CENTER: "종합사회복지관",
    SENIOR_CENTER: "경로당",
    DAYCARE_CENTER: "주간보호센터",
    HOME_CARE_SERVICE: "재가복지서비스"
};

export default function WelfareFacilityList() {
    const [facilities, setFacilities] = useState<WelfareFacilityResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    useEffect(() => {
        // 1. 현재 위치 가져오기
        if (!navigator.geolocation) {
            setError("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude });
                fetchFacilities(latitude, longitude);
            },
            (err) => {
                console.error(err);
                setError("위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
                setLoading(false);
            }
        );
    }, []);

    const fetchFacilities = async (lat: number, lon: number) => {
        try {
            // 반경 1km 내 검색
            const data = await mapApi.getNearbyFacilities(lat, lon, 1);
            setFacilities(data);
        } catch (err) {
            console.error(err);
            setError("시설 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const openExternalMap = (facility: WelfareFacilityResponse) => {
        // 카카오맵 URL 스킴 (웹)
        // https://map.kakao.com/link/to/장소명,위도,경도
        const url = `https://map.kakao.com/link/to/${facility.name},${facility.latitude},${facility.longitude}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                내 주변 복지 시설
            </h1>

            {loading && <div className="text-center py-8">위치 확인 및 데이터 조회 중...</div>}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {!loading && !error && facilities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    반경 1km 이내에 조회된 시설이 없습니다.
                </div>
            )}

            <div className="space-y-4">
                {facilities.map((facility) => (
                    <Card key={facility.id} className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="mb-2">
                                    {facility.typeDescription || FACILITY_TYPE_LABELS[facility.type] || facility.type}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg">{facility.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-start gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{facility.address}</span>
                            </div>
                            {facility.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <a href={`tel:${facility.phone}`} className="hover:underline">
                                        {facility.phone}
                                    </a>
                                </div>
                            )}
                            {facility.operatingHours && (
                                <div className="flex items-start gap-2 text-gray-600">
                                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{facility.operatingHours}</span>
                                </div>
                            )}

                            <Button
                                className="w-full mt-4 bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
                                onClick={() => openExternalMap(facility)}
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                카카오맵으로 보기
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

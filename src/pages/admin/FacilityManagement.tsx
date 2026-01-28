import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { mapApi } from "@/api/map";
import { WelfareFacilityResponse, WelfareFacilityRequest } from "@/types/api";
import { Trash2, RefreshCw, Plus, Pencil, MapPin, Search, Loader2, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/config/adminNavItems";

// Kakao Maps 타입 선언
declare global {
    interface Window {
        daum: any;
        kakao: any;
    }
}

export default function FacilityManagement() {
    const [facilities, setFacilities] = useState<WelfareFacilityResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<WelfareFacilityResponse | null>(null);

    // Geocoding state
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
    const [geocodingSuccess, setGeocodingSuccess] = useState(false);
    const [geocodingError, setGeocodingError] = useState<string | null>(null);

    // Form Data
    const initialFormData: WelfareFacilityRequest = {
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        type: 'ELDERLY_WELFARE_CENTER',
        phone: '',
        operatingHours: ''
    };
    const [formData, setFormData] = useState<WelfareFacilityRequest>(initialFormData);

    // Daum Postcode & Kakao Maps SDK 로딩
    useEffect(() => {
        // Daum Postcode Script
        const postcodeScript = document.createElement("script");
        postcodeScript.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        postcodeScript.async = true;
        document.head.appendChild(postcodeScript);

        // Kakao Maps SDK (with services library for geocoding)
        const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
        if (kakaoApiKey) {
            const kakaoScript = document.createElement("script");
            kakaoScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&libraries=services&autoload=false`;
            kakaoScript.async = true;
            kakaoScript.onload = () => {
                // Kakao SDK 로드 완료 후 초기화
                window.kakao.maps.load(() => {
                    console.log("Kakao Maps SDK loaded successfully");
                });
            };
            document.head.appendChild(kakaoScript);
        }

        return () => {
            if (postcodeScript.parentNode) {
                document.head.removeChild(postcodeScript);
            }
        };
    }, []);

    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {
        setLoading(true);
        try {
            const data = await mapApi.getAllFacilities();
            setFacilities(data);
        } catch (error) {
            console.error(error);
            alert("시설 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, type: value as any }));
    };

    const handleAddressSearch = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert("주소 검색 서비스를 불러오는 중입니다. 잠시만 기다려주세요.");
            return;
        }

        // 상태 초기화
        setGeocodingSuccess(false);
        setGeocodingError(null);

        new window.daum.Postcode({
            oncomplete: function (data: any) {
                const fullAddress = data.address;
                setFormData(prev => ({
                    ...prev,
                    address: fullAddress
                }));

                // Kakao Geocoding API로 좌표 추출
                if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                    setIsGeocodingLoading(true);
                    const geocoder = new window.kakao.maps.services.Geocoder();

                    geocoder.addressSearch(fullAddress, (result: any, status: any) => {
                        setIsGeocodingLoading(false);

                        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                            const lat = parseFloat(result[0].y);
                            const lng = parseFloat(result[0].x);

                            setFormData(prev => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng
                            }));
                            setGeocodingSuccess(true);
                            console.log(`좌표 추출 성공: ${lat}, ${lng}`);
                        } else {
                            setGeocodingError("주소에서 좌표를 추출할 수 없습니다. 다른 주소를 선택해주세요.");
                            console.error("Geocoding failed:", status);
                        }
                    });
                } else {
                    setGeocodingError("Kakao Maps SDK가 로드되지 않았습니다. 페이지를 새로고침 해주세요.");
                }
            }
        }).open();
    };

    const openCreateModal = () => {
        setFormData(initialFormData);
        setGeocodingSuccess(false);
        setGeocodingError(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (facility: WelfareFacilityResponse) => {
        setSelectedFacility(facility);
        setFormData({
            name: facility.name,
            address: facility.address,
            latitude: facility.latitude,
            longitude: facility.longitude,
            type: facility.type,
            phone: facility.phone || '',
            operatingHours: facility.operatingHours || ''
        });
        setGeocodingSuccess(true); // 기존 좌표가 있으므로 성공 상태로
        setGeocodingError(null);
        setIsEditOpen(true);
    };

    const handleCreate = async () => {
        // 좌표 유효성 검사
        if (!formData.latitude || !formData.longitude || formData.latitude === 0 || formData.longitude === 0) {
            alert("주소 검색을 통해 좌표를 설정해주세요.");
            return;
        }

        try {
            await mapApi.createFacility(formData);
            alert("시설이 등록되었습니다.");
            setIsCreateOpen(false);
            loadFacilities();
        } catch (error) {
            console.error(error);
            alert("시설 등록 실패: 입력 값을 확인해주세요.");
        }
    };

    const handleUpdate = async () => {
        if (!selectedFacility) return;
        try {
            await mapApi.updateFacility(selectedFacility.id, formData);
            alert("시설 정보가 수정되었습니다.");
            setIsEditOpen(false);
            loadFacilities();
        } catch (error) {
            console.error(error);
            alert("시설 수정 실패");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("정말 이 시설 정보를 삭제하시겠습니까?")) return;
        try {
            await mapApi.deleteFacility(id);
            alert("삭제되었습니다.");
            loadFacilities();
        } catch (error) {
            console.error(error);
            alert("삭제 실패");
        }
    };

    // Shared Form Component
    const renderForm = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">시설명</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">유형</Label>
                <Select value={formData.type} onValueChange={handleSelectChange}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ELDERLY_WELFARE_CENTER">노인복지관</SelectItem>
                        <SelectItem value="DISABLED_WELFARE_CENTER">장애인복지관</SelectItem>
                        <SelectItem value="CHILD_WELFARE_CENTER">아동복지관</SelectItem>
                        <SelectItem value="COMMUNITY_WELFARE_CENTER">종합사회복지관</SelectItem>
                        <SelectItem value="SENIOR_CENTER">경로당</SelectItem>
                        <SelectItem value="DAYCARE_CENTER">주간보호센터</SelectItem>
                        <SelectItem value="HOME_CARE_SERVICE">재가복지서비스</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">주소</Label>
                <div className="col-span-3 flex gap-2">
                    <Input id="address" name="address" value={formData.address} readOnly className="flex-1 bg-gray-50" placeholder="주소 검색을 클릭하세요" />
                    <Button type="button" variant="outline" onClick={handleAddressSearch}>
                        <Search className="w-4 h-4 mr-2" />
                        주소 검색
                    </Button>
                </div>
            </div>
            {/* 좌표 상태 표시 (위도/경도 입력 필드 대신) */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">좌표 상태</Label>
                <div className="col-span-3">
                    {isGeocodingLoading && (
                        <div className="flex items-center gap-2 text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">좌표 추출 중...</span>
                        </div>
                    )}
                    {geocodingSuccess && !isGeocodingLoading && (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">좌표 설정 완료</span>
                        </div>
                    )}
                    {geocodingError && (
                        <div className="text-sm text-red-600">
                            {geocodingError}
                        </div>
                    )}
                    {!isGeocodingLoading && !geocodingSuccess && !geocodingError && (
                        <div className="text-sm text-gray-500">
                            주소 검색을 통해 좌표가 자동 설정됩니다.
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">연락처</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="operatingHours" className="text-right">운영시간</Label>
                <Input id="operatingHours" name="operatingHours" value={formData.operatingHours} onChange={handleInputChange} className="col-span-3" />
            </div>
        </div>
    );

    return (
        <DashboardLayout role="admin" userName="관리자" navItems={adminNavItems}>
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">사회복지시설 관리</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadFacilities} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            새로고침
                        </Button>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateModal}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    시설 등록
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>새 시설 등록</DialogTitle>
                                </DialogHeader>
                                {renderForm()}
                                <DialogFooter>
                                    <Button type="submit" onClick={handleCreate}>등록</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>등록된 시설 목록 ({facilities.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>시설명</TableHead>
                                    <TableHead>유형</TableHead>
                                    <TableHead>주소</TableHead>
                                    <TableHead>연락처</TableHead>
                                    <TableHead className="text-right">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {facilities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            데이터가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    facilities.map((facility) => (
                                        <TableRow key={facility.id}>
                                            <TableCell>{facility.id}</TableCell>
                                            <TableCell className="font-medium">{facility.name}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {facility.typeDescription || facility.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>{facility.address}</TableCell>
                                            <TableCell>{facility.phone || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(facility)}
                                                    >
                                                        <Pencil className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(facility.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Edit Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>시설 정보 수정</DialogTitle>
                        </DialogHeader>
                        {renderForm()}
                        <DialogFooter>
                            <Button type="submit" onClick={handleUpdate}>수정 내용 저장</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout >
    );
}

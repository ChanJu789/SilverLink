import { useState, useCallback } from "react";
import { startPasskeyLogin, finishPasskeyLogin, startPasskeyRegistration, finishPasskeyRegistration } from "@/api/passkey";
import { setAccessToken } from "@/api/index";

// WebAuthn 지원 여부 확인
export const isWebAuthnSupported = () => {
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create &&
    navigator.credentials.get
  );
};

// 플랫폼 인증기(지문, Face ID 등) 지원 여부 확인
export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

interface UseWebAuthnReturn {
  isSupported: boolean;
  isPlatformAvailable: boolean | null;
  isRegistering: boolean;
  isAuthenticating: boolean;
  error: string | null;
  register: (userId: number) => Promise<boolean>;
  authenticate: () => Promise<{ success: boolean; accessToken?: string; role?: string }>;
  checkPlatformAuthenticator: () => Promise<void>;
}

export const useWebAuthn = (): UseWebAuthnReturn => {
  const [isSupported] = useState(() => isWebAuthnSupported());
  const [isPlatformAvailable, setIsPlatformAvailable] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPlatformAuthenticator = useCallback(async () => {
    const available = await isPlatformAuthenticatorAvailable();
    setIsPlatformAvailable(available);
  }, []);

  // 지문/생체 인증 등록 (백엔드 API 연동)
  const register = useCallback(async (userId: number): Promise<boolean> => {
    if (!isWebAuthnSupported()) {
      setError("이 기기에서는 생체 인증을 지원하지 않습니다.");
      return false;
    }

    setIsRegistering(true);
    setError(null);

    try {
      // 1. 서버에서 등록 옵션 가져오기
      const startResponse = await startPasskeyRegistration(userId);
      const creationOptions = JSON.parse(startResponse.creationOptionsJson);

      // challenge와 user.id를 ArrayBuffer로 변환
      creationOptions.challenge = base64URLDecode(creationOptions.challenge);
      creationOptions.user.id = base64URLDecode(creationOptions.user.id);

      if (creationOptions.excludeCredentials) {
        creationOptions.excludeCredentials = creationOptions.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64URLDecode(cred.id),
        }));
      }

      // 2. 브라우저가 "지문 대세요" 창을 띄움
      const credential = await navigator.credentials.create({
        publicKey: creationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        setError("인증 정보를 생성하지 못했습니다.");
        return false;
      }

      // 3. 서버에 등록 완료 요청
      const attestationResponse = credential.response as AuthenticatorAttestationResponse;
      const credentialJson = JSON.stringify({
        id: credential.id,
        rawId: base64URLEncode(credential.rawId),
        response: {
          attestationObject: base64URLEncode(attestationResponse.attestationObject),
          clientDataJSON: base64URLEncode(attestationResponse.clientDataJSON),
        },
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults(),
      });

      await finishPasskeyRegistration(userId, startResponse.requestId, credentialJson);
      return true;

    } catch (err: unknown) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("인증이 취소되었습니다. 다시 시도해주세요.");
        } else if (err.name === "NotSupportedError") {
          setError("이 기기에서는 생체 인증을 지원하지 않습니다.");
        } else {
          setError("등록 중 오류가 발생했습니다: " + err.message);
        }
      }
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  // 지문/생체 인증 로그인 (백엔드 API 연동)
  const authenticate = useCallback(async (): Promise<{ success: boolean; accessToken?: string; role?: string }> => {
    if (!isWebAuthnSupported()) {
      setError("이 기기에서는 생체 인증을 지원하지 않습니다.");
      return { success: false };
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. 서버에서 인증 옵션 가져오기
      const startResponse = await startPasskeyLogin();
      const assertionOptions = JSON.parse(startResponse.assertionRequestJson);

      // challenge와 allowCredentials.id를 ArrayBuffer로 변환
      assertionOptions.challenge = base64URLDecode(assertionOptions.challenge);
      if (assertionOptions.allowCredentials) {
        assertionOptions.allowCredentials = assertionOptions.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64URLDecode(cred.id),
        }));
      }

      // 2. 브라우저가 "저장된 패스키로 로그인할까요?" 창을 띄움
      const credential = await navigator.credentials.get({
        publicKey: assertionOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        setError("인증 정보를 가져오지 못했습니다.");
        return { success: false };
      }

      // 3. 서버에 인증 완료 요청 및 토큰 발급 받기
      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      const credentialJson = JSON.stringify({
        id: credential.id,
        rawId: base64URLEncode(credential.rawId),
        response: {
          authenticatorData: base64URLEncode(assertionResponse.authenticatorData),
          clientDataJSON: base64URLEncode(assertionResponse.clientDataJSON),
          signature: base64URLEncode(assertionResponse.signature),
          userHandle: assertionResponse.userHandle ? base64URLEncode(assertionResponse.userHandle) : null,
        },
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults(),
      });

      // Note: backend uses 'requsetId' (typo)
      const tokenResponse = await finishPasskeyLogin(startResponse.requsetId, credentialJson);

      // 토큰 저장
      setAccessToken(tokenResponse.accessToken);

      return {
        success: true,
        accessToken: tokenResponse.accessToken,
        role: tokenResponse.role,
      };

    } catch (err: unknown) {
      console.error("Authentication error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("인증이 취소되었습니다. 다시 시도해주세요.");
        } else if (err.name === "NotSupportedError") {
          setError("이 기기에서는 생체 인증을 지원하지 않습니다.");
        } else if (err.message?.includes("WEBAUTHN")) {
          // 백엔드 에러
          if (err.message.includes("CRED_NOT_FOUND")) {
            setError("등록된 생체 인증 정보가 없습니다. 먼저 등록해주세요.");
          } else if (err.message.includes("AUTH_REQUEST_EXPIRED")) {
            setError("인증 요청이 만료되었습니다. 다시 시도해주세요.");
          } else {
            setError("로그인 중 오류가 발생했습니다.");
          }
        } else {
          setError("로그인 중 오류가 발생했습니다: " + err.message);
        }
      }
      return { success: false };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    isSupported,
    isPlatformAvailable,
    isRegistering,
    isAuthenticating,
    error,
    register,
    authenticate,
    checkPlatformAuthenticator,
  };
};

// Base64URL 인코딩/디코딩 유틸리티
const base64URLEncode = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const base64URLDecode = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

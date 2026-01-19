import { useState, useCallback } from "react";

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

// 랜덤 챌린지 생성 (실제로는 서버에서 생성해야 함)
const generateChallenge = (): ArrayBuffer => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array.buffer;
};

// 사용자 ID 생성
const generateUserId = (): ArrayBuffer => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return array.buffer;
};

interface WebAuthnCredential {
  id: string;
  rawId: string;
  type: string;
}

interface UseWebAuthnReturn {
  isSupported: boolean;
  isPlatformAvailable: boolean | null;
  isRegistering: boolean;
  isAuthenticating: boolean;
  error: string | null;
  register: (username: string) => Promise<WebAuthnCredential | null>;
  authenticate: () => Promise<boolean>;
  checkPlatformAuthenticator: () => Promise<void>;
}

const CREDENTIAL_STORAGE_KEY = "webauthn_credentials";

// 저장된 크레덴셜 가져오기
const getStoredCredentials = (): string[] => {
  try {
    const stored = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// 크레덴셜 저장
const storeCredential = (credentialId: string): void => {
  const credentials = getStoredCredentials();
  if (!credentials.includes(credentialId)) {
    credentials.push(credentialId);
    localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credentials));
  }
};

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

  // 지문/생체 인증 등록
  const register = useCallback(async (username: string): Promise<WebAuthnCredential | null> => {
    if (!isWebAuthnSupported()) {
      setError("이 기기에서는 생체 인증을 지원하지 않습니다.");
      return null;
    }

    setIsRegistering(true);
    setError(null);

    try {
      // 실제 서버에서 받아올 옵션 (여기서는 시뮬레이션)
      const registrationOptions: PublicKeyCredentialCreationOptions = {
        challenge: generateChallenge(),
        rp: {
          name: "마음돌봄",
          id: window.location.hostname,
        },
        user: {
          id: generateUserId(),
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // 플랫폼 인증기 (지문, Face ID)
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      };

      // 브라우저가 "지문 대세요" 창을 띄움
      const credential = await navigator.credentials.create({
        publicKey: registrationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        const credentialData: WebAuthnCredential = {
          id: credential.id,
          rawId: base64URLEncode(credential.rawId),
          type: credential.type,
        };

        // 크레덴셜 저장 (실제로는 서버에 저장해야 함)
        storeCredential(credential.id);

        return credentialData;
      }

      return null;
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
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  // 지문/생체 인증 로그인
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isWebAuthnSupported()) {
      setError("이 기기에서는 생체 인증을 지원하지 않습니다.");
      return false;
    }

    const storedCredentials = getStoredCredentials();
    if (storedCredentials.length === 0) {
      setError("등록된 생체 인증 정보가 없습니다. 먼저 등록해주세요.");
      return false;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // 실제 서버에서 받아올 옵션 (여기서는 시뮬레이션)
      const authenticationOptions: PublicKeyCredentialRequestOptions = {
        challenge: generateChallenge(),
        rpId: window.location.hostname,
        allowCredentials: storedCredentials.map((id) => ({
          id: base64URLDecode(id),
          type: "public-key" as const,
          transports: ["internal"] as AuthenticatorTransport[],
        })),
        userVerification: "required",
        timeout: 60000,
      };

      // 브라우저가 "저장된 패스키로 로그인할까요?" 창을 띄움
      const credential = await navigator.credentials.get({
        publicKey: authenticationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // 실제로는 서버에서 검증해야 함
        return true;
      }

      return false;
    } catch (err: unknown) {
      console.error("Authentication error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("인증이 취소되었습니다. 다시 시도해주세요.");
        } else if (err.name === "NotSupportedError") {
          setError("이 기기에서는 생체 인증을 지원하지 않습니다.");
        } else {
          setError("로그인 중 오류가 발생했습니다: " + err.message);
        }
      }
      return false;
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

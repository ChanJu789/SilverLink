import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DuplicateLoginDialog } from '@/components/auth/DuplicateLoginDialog';

interface DuplicateLoginContextType {
  showDuplicateLoginDialog: () => void;
}

const DuplicateLoginContext = createContext<DuplicateLoginContextType | undefined>(undefined);

export const DuplicateLoginProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const showDuplicateLoginDialog = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // 전역 핸들러 등록
  useEffect(() => {
    setGlobalDuplicateLoginHandler(showDuplicateLoginDialog);
    return () => {
      setGlobalDuplicateLoginHandler(() => {});
    };
  }, []);

  return (
    <DuplicateLoginContext.Provider value={{ showDuplicateLoginDialog }}>
      {children}
      <DuplicateLoginDialog open={isOpen} onClose={handleClose} />
    </DuplicateLoginContext.Provider>
  );
};

export const useDuplicateLogin = () => {
  const context = useContext(DuplicateLoginContext);
  if (!context) {
    throw new Error('useDuplicateLogin must be used within DuplicateLoginProvider');
  }
  return context;
};

// API 인터셉터에서 사용할 전역 함수
let globalShowDuplicateLogin: (() => void) | null = null;

export const setGlobalDuplicateLoginHandler = (handler: () => void) => {
  globalShowDuplicateLogin = handler;
};

export const showGlobalDuplicateLoginDialog = () => {
  if (globalShowDuplicateLogin) {
    globalShowDuplicateLogin();
  } else {
    // Fallback to alert if context is not available
    alert('이미 다른 기기에서 로그인되어 있습니다. 기존 세션을 종료하고 다시 로그인해주세요.');
  }
};

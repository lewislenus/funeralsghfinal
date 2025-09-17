'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import PageFlipViewer from './pageflip-viewer';
import { EnhancedPdfViewer } from './enhanced-pdf-viewer';

// Global default viewer mode (changed from 'flip' to 'enhanced')
const ACTIVE_VIEWER: 'flip' | 'enhanced' = 'enhanced';

interface BrochureViewerContextType {
  openBrochure: (pdfUrl: string, options?: BrochureOptions) => void;
  closeBrochure: () => void;
  isOpen: boolean;
}

interface BrochureOptions {
  title?: string;
  description?: string;
  mode?: 'auto' | 'flip' | 'enhanced';
}

interface BrochureState {
  isOpen: boolean;
  pdfUrl: string;
  title?: string;
  description?: string;
  mode: 'flip' | 'enhanced';
}

const BrochureViewerContext = createContext<BrochureViewerContextType | null>(null);

export function BrochureViewerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BrochureState>({
    isOpen: false,
    pdfUrl: '',
    mode: ACTIVE_VIEWER,
  });

  const openBrochure = useCallback((pdfUrl: string, options: BrochureOptions = {}) => {
    const mode = options.mode === 'auto' ? ACTIVE_VIEWER : (options.mode || ACTIVE_VIEWER);
    
    setState({
      isOpen: true,
      pdfUrl,
      title: options.title,
      description: options.description,
      mode,
    });
  }, []);

  const closeBrochure = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const contextValue: BrochureViewerContextType = {
    openBrochure,
    closeBrochure,
    isOpen: state.isOpen,
  };

  return (
    <BrochureViewerContext.Provider value={contextValue}>
      {children}
      
      {/* Render the appropriate viewer based on mode */}
      {state.isOpen && (
        <>
          {state.mode === 'flip' && (
            <PageFlipViewer
              pdfUrl={state.pdfUrl}
              autoOpen={state.isOpen}
              onClose={closeBrochure}
              title={state.title}
            />
          )}
          
          {state.mode === 'enhanced' && (
            <EnhancedPdfViewer
              pdfUrl={state.pdfUrl}
              autoOpen={state.isOpen}
              onClose={closeBrochure}
              title={state.title}
            />
          )}
        </>
      )}
    </BrochureViewerContext.Provider>
  );
}

export function useBrochureViewer() {
  const context = useContext(BrochureViewerContext);
  if (!context) {
    throw new Error('useBrochureViewer must be used within a BrochureViewerProvider');
  }
  return context;
}

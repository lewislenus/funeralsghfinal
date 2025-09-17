declare module "react-pageflip" {
  import * as React from "react";

  export interface HTMLFlipBookProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: number;
    height?: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    className?: string;
  }

  export interface PageFlipHandler {
    pageFlip(): {
      flipNext(): void;
      flipPrev(): void;
    };
  }

  const HTMLFlipBook: React.ForwardRefExoticComponent<HTMLFlipBookProps & React.RefAttributes<PageFlipHandler>>;
  export default HTMLFlipBook;
}

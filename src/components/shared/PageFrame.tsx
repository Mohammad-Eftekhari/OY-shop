import type { ReactNode } from "react";

type TPageFrameProps = {
  children: ReactNode;
};

export const PageFrame = ({ children }: TPageFrameProps) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12 md:px-16">
      {children}
    </div>
  );
};

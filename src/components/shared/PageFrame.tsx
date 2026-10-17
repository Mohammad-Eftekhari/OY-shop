import type { ReactNode } from "react";

type TPageFrameProps = {
  children: ReactNode;
};

export const PageFrame = ({ children }: TPageFrameProps) => {
  return <div className="flex w-full flex-1 flex-col px-4 py-10 md:px-8 md:py-14">{children}</div>;
};

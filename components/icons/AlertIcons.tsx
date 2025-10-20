"use client";

import * as React from "react";
import { Info, AlertTriangle, CheckCircle2, OctagonX } from "lucide-react";

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

export function InfoIcon(props: IconProps) {
  return <Info aria-hidden className={props.className} />;
}

export function WarningIcon(props: IconProps) {
  return <AlertTriangle aria-hidden className={props.className} />;
}

export function CheckCircleIcon(props: IconProps) {
  return <CheckCircle2 aria-hidden className={props.className} />;
}

export function ErrorIcon(props: IconProps) {
  return <OctagonX aria-hidden className={props.className} />;
}




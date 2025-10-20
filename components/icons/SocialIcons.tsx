"use client";

import * as React from "react";
import { FaFacebook, FaGoogle } from "react-icons/fa6";

type IconProps = {
  className?: string;
  size?: number | string;
};

export function GoogleIcon({ className, size = 16 }: IconProps) {
  return <FaGoogle aria-hidden className={className} size={size} />;
}

export function FacebookIcon({ className, size = 16 }: IconProps) {
  return <FaFacebook aria-hidden className={className} size={size} />;
}




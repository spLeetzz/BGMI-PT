"use client";

import { useEffect } from "react";
import { addTournament } from "@/lib/storage";

type Props = { slug: string };

export default function RegisterTournament({ slug }: Props) {
  useEffect(() => {
    addTournament(slug);
  }, [slug]);

  return null;
}

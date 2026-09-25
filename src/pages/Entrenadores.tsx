/**
 * Entrenadores — los nueve, y nada más.
 *
 * El ADN estuvo acá un rato y no pegaba: son cosas distintas. El ADN vive en
 * el Camino, que es donde se sella; acá se practica contra algo que responde.
 */
import React from 'react';
import type { ProfileV2 } from '../lib/supabase';
import Agentes from './Agentes';

interface Props {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  setCurrentPage?: (p: string) => void;
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

export default function Entrenadores({ userId, perfil, setCurrentPage }: Props) {
  return <Agentes userId={userId} perfil={perfil} setCurrentPage={setCurrentPage} />;
}

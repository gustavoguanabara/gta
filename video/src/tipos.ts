export type Fala = {
  speaker: string;
  name: string;
  text: string;
};

export type Escena = {
  id: string;
  missionId: string;
  kind: 'mission' | 'encounter';
  section: 'inicio' | 'fin' | 'escena';
  order: number;
  missionNumber: number;
  title: string;
  color: string;
  logo: string;
  left: string;
  right: string;
  lines: Fala[];
  reward: { name: string; image: string; letter: string } | null;
  timing: { intro: number; perLine: number[]; outro: number; total: number };
  characters: { id: string; name: string; profile: string }[];
};

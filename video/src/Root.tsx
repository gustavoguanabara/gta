import React from 'react';
import { Composition, Folder } from 'remotion';
import { Dialogo } from './Dialogo';
import { ESCENAS } from './escenas.generated';

// Un video por bloque de diálogo de la historia. Los textos salen de story/missions/*.md
// (npm run sync); por eso las composiciones se registran desde los datos.
export const RemotionRoot: React.FC = () => {
  const misiones = [...new Set(ESCENAS.map((e) => e.missionId))];
  return (
    <>
      {misiones.map((m) => (
        <Folder key={m} name={m}>
          {ESCENAS.filter((e) => e.missionId === m).map((escena) => (
            <Composition
              key={escena.id}
              id={escena.id}
              component={Dialogo}
              durationInFrames={escena.timing.total}
              fps={30}
              width={1280}
              height={720}
              defaultProps={{ escena }}
            />
          ))}
        </Folder>
      ))}
      <Folder name="vertical">
        {ESCENAS.map((escena) => (
          <Composition
            key={`${escena.id}-v`}
            id={`${escena.id}-v`}
            component={Dialogo}
            durationInFrames={escena.timing.total}
            fps={30}
            width={720}
            height={1280}
            defaultProps={{ escena }}
          />
        ))}
      </Folder>
    </>
  );
};

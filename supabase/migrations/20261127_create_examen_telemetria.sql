-- Tabla de telemetría granular por respuesta
-- Guarda todos los eventos (Monaco Editor, navegación, etc.) vinculados a una pregunta específica de un intento

CREATE TABLE examen_telemetria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intento_id UUID NOT NULL REFERENCES examen_intento(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES pregunta(id) ON DELETE CASCADE,
  evento_type TEXT NOT NULL,
  severidad TEXT NOT NULL CHECK (severidad IN ('baja', 'media', 'alta')),
  payload JSONB NOT NULL DEFAULT '{}',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas típicas
CREATE INDEX idx_examen_telemetria_intento_pregunta ON examen_telemetria (intento_id, pregunta_id);
CREATE INDEX idx_examen_telemetria_intento ON examen_telemetria (intento_id);
CREATE INDEX idx_examen_telemetria_tipo ON examen_telemetria (evento_type);
CREATE INDEX idx_examen_telemetria_severidad ON examen_telemetria (severidad);

-- RLS: Solo el alumno dueño del intento o docentes/admins del grupo pueden ver
ALTER TABLE examen_telemetria ENABLE ROW LEVEL SECURITY;

-- Política: alumno ve su propia telemetría
CREATE POLICY "Alumno ve su telemetría"
  ON examen_telemetria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM examen_intento ei
      JOIN grupo_estudiante ge ON ge.alumno_id = ei.alumno_id
      WHERE ei.id = examen_telemetria.intento_id
      AND ge.alumno_id = auth.uid()::text
    )
  );

-- Política: docente del grupo ve telemetría de sus alumnos
CREATE POLICY "Docente ve telemetría de su grupo"
  ON examen_telemetria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM examen_intento ei
      JOIN evaluacion e ON e.id = ei.evaluacion_id
      JOIN grupo g ON g.id = e.grupo_id
      JOIN docente d ON d.id = g.docente_id
      WHERE ei.id = examen_telemetria.intento_id
      AND d.usuario_id = auth.uid()::text
    )
  );

-- Política: admin ve todo
CREATE POLICY "Admin ve toda telemetría"
  ON examen_telemetria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM administrador WHERE usuario_id = auth.uid()::text
    )
  );

-- Inserción: solo desde service role (API) o alumno dueño del intento en curso
CREATE POLICY "Service role inserta telemetría"
  ON examen_telemetria FOR INSERT
  WITH CHECK (true); -- Validado en API
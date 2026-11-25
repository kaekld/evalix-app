"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import ExamenForm from "./ExamenForm";
import type { Examen, GrupoOption } from "./types";

interface CrearExamenModalProps {
  grupos: GrupoOption[];
  onCreated: (examen: Examen) => void;
}

export default function CrearExamenModal({ grupos, onCreated }: CrearExamenModalProps) {
  const [open, setOpen] = useState(false);

  const handleCreated = (examen: Examen) => {
    onCreated(examen);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={grupos.length === 0}>
        Crear examen
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Crear examen"
        description="Define los datos generales del examen."
        size="lg"
      >
        <ExamenForm
          grupos={grupos}
          onCreated={handleCreated}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

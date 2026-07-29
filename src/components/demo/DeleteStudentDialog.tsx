import { Modal, ModalButton } from "./Modal";

export function DeleteStudentDialog({
  open,
  studentName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  studentName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`¿Eliminar a ${studentName}?`}
      size="sm"
      footer={
        <>
          <ModalButton onClick={onClose}>Cancelar</ModalButton>
          <ModalButton variant="danger" onClick={onConfirm}>
            Eliminar alumno
          </ModalButton>
        </>
      }
    >
      <p className="text-sm text-ink-muted">
        Esta acción eliminará al alumno y todos sus datos de la demo. No se puede deshacer.
      </p>
    </Modal>
  );
}

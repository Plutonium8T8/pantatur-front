import { Modal, Text } from "@mantine/core"

export const MantineModal = ({ children, open, title, onClose }) => {
  return (
    <Modal
      centered
      size="lg"
      opened={open}
      onClose={onClose}
      title={
        <Text size="xl" fw="bold">
          {title}
        </Text>
      }
    >
      {children}
    </Modal>
  )
}

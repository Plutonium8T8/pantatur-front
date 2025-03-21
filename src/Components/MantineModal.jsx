import { Modal, Text } from "@mantine/core"

export const MantineModal = ({
  children,
  open,
  title,
  onClose,
  footer,
  ...props
}) => {
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
      {...props}
    >
      {children}
    </Modal>
  )
}

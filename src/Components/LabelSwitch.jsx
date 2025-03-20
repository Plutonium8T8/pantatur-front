import { Flex, Text, Switch } from "@mantine/core"

export const LabelSwitch = ({ mt, label, ...props }) => {
  return (
    <Flex align="center" justify="space-between" mt={mt}>
      <Text size="sm">{label}</Text>
      <Switch {...props} />
    </Flex>
  )
}

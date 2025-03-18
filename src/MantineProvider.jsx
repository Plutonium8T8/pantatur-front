import { MantineProvider as BaseMantineProvider } from "@mantine/core"

export const MantineProvider = ({ children }) => {
  return <BaseMantineProvider>{children}</BaseMantineProvider>
}

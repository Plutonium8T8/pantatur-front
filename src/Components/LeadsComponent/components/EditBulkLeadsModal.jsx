import {
  Modal,
  Tabs,
  Select,
  TextInput,
  Textarea,
  Button,
  Switch,
  Flex,
  Text,
  Box,
  LoadingOverlay
} from "@mantine/core"
import { useSnackbar } from "notistack"
import { useState } from "react"
import { useForm } from "@mantine/form"
import { getLanguageByKey, showServerError } from "../../utils"
import {
  workflowOptions,
  priorityOptions,
  groupTitleOptions
} from "../../../FormOptions"
import { useGetTechniciansList } from "../../../hooks"
import { Segmented } from "../../Segmented"
import { api } from "../../../api"

export const EditBulkLeadsModal = ({ open, onClose, selectedTickets }) => {
  const { enqueueSnackbar } = useSnackbar()
  const form = useForm({
    mode: "uncontrolled"
  })
  const { technicians } = useGetTechniciansList()

  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()

    setLoading(true)
    try {
      await api.tickets.updateById({
        id: selectedTickets,
        ...form.getValues()
      })
      onClose()
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Modal
        centered
        opened={open}
        onClose={onClose}
        size="lg"
        loading={true}
        withOverlay
        title="Editeaza in grup"
      >
        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab value="general">General information</Tabs.Tab>
            <Tabs.Tab value="info">Info</Tabs.Tab>
            <Tabs.Tab value="contact">Contact</Tabs.Tab>
            <Tabs.Tab value="invoice">Invoice</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="xs">
            <form onSubmit={submit}>
              <Select
                label={getLanguageByKey("Workflow")}
                placeholder={getLanguageByKey("Selectează flux de lucru")}
                data={workflowOptions}
                clearable
                key={form.key("workflow")}
                {...form.getInputProps("workflow")}
              />

              <Select
                mt="md"
                label={getLanguageByKey("Prioritate")}
                placeholder={getLanguageByKey("Selectează prioritate")}
                data={priorityOptions}
                clearable
                key={form.key("priority")}
                {...form.getInputProps("priority")}
              />

              <TextInput
                mt="md"
                label={getLanguageByKey("Contact")}
                placeholder={getLanguageByKey("Selectează contact")}
                key={form.key("contact")}
                {...form.getInputProps("contact")}
              />

              <TextInput
                mt="md"
                label={getLanguageByKey("Tag-uri")}
                placeholder={getLanguageByKey(
                  "Introdu tag-uri separate prin virgule"
                )}
                key={form.key("tag")}
                {...form.getInputProps("tag")}
              />

              <Segmented
                options={groupTitleOptions.map((item) => ({
                  value: item,
                  label: item
                }))}
                mt="md"
                key={form.key("group_title")}
                {...form.getInputProps("group_title")}
              />

              <Select
                mt="md"
                label={getLanguageByKey("Tehnician")}
                placeholder={getLanguageByKey("Selectează tehnician")}
                data={technicians}
                clearable
                key={form.key("technician_id")}
                {...form.getInputProps("technician_id")}
              />

              <Flex mt="md" align="center" justify="space-between">
                <Text>{getLanguageByKey("Status")}</Text>
                <Switch
                  key={form.key("status")}
                  {...form.getInputProps("status")}
                />
              </Flex>

              <Textarea
                mt="md"
                label={getLanguageByKey("Descriere")}
                placeholder={getLanguageByKey("Descriere")}
                key={form.key("description")}
                {...form.getInputProps("description")}
              />

              <Flex justify="end" gap="md" mt="md">
                <Button variant="default" onClick={onClose}>
                  Close
                </Button>
                <Button loading={loading} type="submit">
                  Submit
                </Button>
              </Flex>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="info" pt="xs">
            Info
          </Tabs.Panel>
          <Tabs.Panel value="contact" pt="xs">
            Contact
          </Tabs.Panel>
          <Tabs.Panel value="invoice" pt="xs">
            Invoice
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Box>
  )
}

import {
  Select,
  TextInput,
  Textarea,
  Button,
  Flex,
  SegmentedControl
} from "@mantine/core"
import { useForm } from "@mantine/form"
import {
  workflowOptions,
  priorityOptions,
  groupTitleOptions
} from "../../../FormOptions"
import { getLanguageByKey } from "../../utils"
import { useGetTechniciansList } from "../../../hooks"

export const GeneralInfoTicketForm = ({ onSubmit, onClose, loading }) => {
  const { technicians } = useGetTechniciansList()
  const form = useForm({
    mode: "uncontrolled"
  })

  const close = () => {
    form.reset()
    onClose()
  }

  return (
    <form
      onSubmit={form.onSubmit((values) => onSubmit(values, () => form.reset()))}
    >
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
        placeholder={getLanguageByKey("Introdu tag-uri separate prin virgule")}
        key={form.key("tag")}
        {...form.getInputProps("tag")}
      />

      <SegmentedControl
        fullWidth
        data={groupTitleOptions.map((item) => ({
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

      <Textarea
        mt="md"
        label={getLanguageByKey("Descriere")}
        placeholder={getLanguageByKey("Descriere")}
        minRows={4}
        autosize
        key={form.key("description")}
        {...form.getInputProps("description")}
      />

      <Flex justify="end" gap="md" mt="md">
        <Button variant="default" onClick={close}>
          {getLanguageByKey("Închide")}
        </Button>
        <Button loading={loading} type="submit">
          {getLanguageByKey("Trimite")}
        </Button>
      </Flex>
    </form>
  )
}

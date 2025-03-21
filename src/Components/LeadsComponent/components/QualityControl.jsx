import { MultiSelect, Select, TextInput, Button, Flex } from "@mantine/core"
import { useForm } from "@mantine/form"
import { getLanguageByKey } from "../../utils"
import {
  motivulRefuzuluiOptions,
  evaluareOdihnaOptions
} from "../../../FormOptions"

export const QualityControl = ({ onSubmit, onClose, loading, data }) => {
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
      <MultiSelect
        clearable
        searchable
        label={getLanguageByKey("Motivul refuzului")}
        placeholder={getLanguageByKey("Motivul refuzului")}
        data={motivulRefuzuluiOptions}
        key={form.key("motivul_refuzului")}
        {...form.getInputProps("motivul_refuzului")}
      />

      <Select
        mt="md"
        clearable
        searchable
        label={getLanguageByKey("Evaluare odihnă")}
        placeholder={getLanguageByKey("Evaluare odihnă")}
        data={evaluareOdihnaOptions}
        key={form.key("evaluare_de_odihna")}
        {...form.getInputProps("evaluare_de_odihna")}
      />

      <TextInput
        mt="md"
        label={getLanguageByKey("Următoarea vacanță")}
        placeholder={getLanguageByKey("Următoarea vacanță")}
        key={form.key("urmatoarea_vacanta")}
        {...form.getInputProps("urmatoarea_vacanta")}
      />

      <TextInput
        mt="md"
        label={getLanguageByKey("Manager")}
        placeholder={getLanguageByKey("Manager")}
        key={form.key("manager")}
        {...form.getInputProps("manager")}
      />

      <TextInput
        mt="md"
        label={getLanguageByKey("Vacanța")}
        placeholder={getLanguageByKey("Vacanța")}
        key={form.key("vacanta")}
        {...form.getInputProps("vacanta")}
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

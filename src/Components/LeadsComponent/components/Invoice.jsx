import { Select, TextInput, Button, Flex, NumberInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { getLanguageByKey } from "../../utils"
import { valutaOptions, ibanOptions } from "../../../FormOptions"

export const Invoice = ({ onSubmit, onClose, loading, data }) => {
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
      <TextInput
        label={getLanguageByKey("F/service")}
        placeholder={getLanguageByKey("F/service")}
        key={form.key("f_serviciu")}
        {...form.getInputProps("f_serviciu")}
      />

      <TextInput
        mt="md"
        label={getLanguageByKey("F/factura")}
        placeholder={getLanguageByKey("F/factura")}
        key={form.key("f_nr_factura")}
        {...form.getInputProps("f_nr_factura")}
      />

      <TextInput
        mt="md"
        label={getLanguageByKey("F/numarul")}
        placeholder={getLanguageByKey("F/numarul")}
        key={form.key("f_numarul")}
        {...form.getInputProps("f_numarul")}
      />

      <NumberInput
        hideControls
        mt="md"
        label={getLanguageByKey("F/preț")}
        placeholder={getLanguageByKey("F/preț")}
        key={form.key("f_pret")}
        {...form.getInputProps("f_pret")}
      />

      <NumberInput
        mt="md"
        hideControls
        label={getLanguageByKey("F/sumă")}
        placeholder={getLanguageByKey("F/sumă")}
        key={form.key("f_suma")}
        {...form.getInputProps("f_suma")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Valuta contului")}
        placeholder={getLanguageByKey("Valuta contului")}
        data={valutaOptions}
        clearable
        key={form.key("valuta_contului")}
        {...form.getInputProps("valuta_contului")}
      />

      <Select
        mt="md"
        label="IBAN"
        placeholder="IBAN"
        data={ibanOptions}
        clearable
        key={form.key("iban")}
        {...form.getInputProps("iban")}
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

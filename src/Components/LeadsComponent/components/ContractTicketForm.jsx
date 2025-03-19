import { TextInput, Select, NumberInput, Flex, Button } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { getLanguageByKey } from "../../utils"
import { LabelSwitch } from "../../LabelSwitch"
import { paymentStatusOptions } from "../../../FormOptions"

export const ContractTicketForm = ({ onClose, onSubmit, loading }) => {
  const form = useForm({
    mode: "uncontrolled"
  })

  const submit = (e) => {
    e.preventDefault()

    onSubmit(form.getValues())
  }
  return (
    <form onSubmit={submit}>
      <TextInput
        mt="md"
        label={getLanguageByKey("Nr de contract")}
        placeholder={getLanguageByKey("Nr de contract")}
        key={form.key("numar_de_contract")}
        {...form.getInputProps("numar_de_contract")}
      />
      <DatePickerInput
        mt="md"
        label={getLanguageByKey("Data contractului")}
        placeholder={getLanguageByKey("Data contractului")}
        key={form.key("data_contractului")}
        {...form.getInputProps("data_contractului")}
      />

      <LabelSwitch
        mt="md"
        label={getLanguageByKey("Contract trimis")}
        key={form.key("contract_trimis")}
        {...form.getInputProps("contract_trimis")}
      />

      <LabelSwitch
        mt="md"
        label={getLanguageByKey("Contract semnat")}
        key={form.key("contract_semnat")}
        {...form.getInputProps("contract_semnat")}
      />

      <TextInput
        mt="md"
        label={getLanguageByKey("Operator turistic")}
        placeholder={getLanguageByKey("Operator turistic")}
        key={form.key("tour_operator")}
        {...form.getInputProps("tour_operator")}
      />

      <TextInput
        mt="md"
        label={getLanguageByKey("Nr cererii de la operator")}
        placeholder={getLanguageByKey("Nr cererii de la operator")}
        key={form.key("numarul_cererii_de_la_operator")}
        {...form.getInputProps("numarul_cererii_de_la_operator")}
      />

      <LabelSwitch
        label={getLanguageByKey("Achitare efectuată")}
        key={form.key("achitare_efectuata")}
        {...form.getInputProps("achitare_efectuata")}
      />

      <LabelSwitch
        mt="md"
        label={getLanguageByKey("Rezervare confirmată")}
        key={form.key("rezervare_confirmata")}
        {...form.getInputProps("rezervare_confirmata")}
      />

      <LabelSwitch
        mt="md"
        label={getLanguageByKey("Contract arhivat")}
        key={form.key("contract_arhivat")}
        {...form.getInputProps("contract_arhivat")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Plată primită")}
        placeholder={getLanguageByKey("Plată primită")}
        data={paymentStatusOptions}
        clearable
        key={form.key("priority")}
        {...form.getInputProps("priority")}
      />

      <NumberInput
        hideControls
        mt="md"
        label={`${getLanguageByKey("Avans euro")} €`}
        placeholder={`${getLanguageByKey("Avans euro")} €`}
        key={form.key("avans_euro")}
        {...form.getInputProps("avans_euro")}
      />
      <DatePickerInput
        mt="md"
        label={getLanguageByKey("Data avansului")}
        placeholder={getLanguageByKey("Data avansului")}
        key={form.key("data_avansului")}
        {...form.getInputProps("data_avansului")}
      />

      <DatePickerInput
        mt="md"
        label={getLanguageByKey("Data de plată integrală")}
        placeholder={getLanguageByKey("Data de plată integrală")}
        key={form.key("data_de_plata_integrala")}
        {...form.getInputProps("data_de_plata_integrala")}
      />

      <NumberInput
        hideControls
        mt="md"
        label={`${getLanguageByKey("Preț NETTO")} €`}
        placeholder={`${getLanguageByKey("Preț NETTO")} €`}
        key={form.key("pret_netto")}
        {...form.getInputProps("pret_netto")}
      />

      <NumberInput
        hideControls
        mt="md"
        label={getLanguageByKey("Achitat client")}
        placeholder={getLanguageByKey("Achitat client")}
        key={form.key("achitat_client")}
        {...form.getInputProps("achitat_client")}
      />

      <NumberInput
        disabled
        hideControls
        mt="md"
        label={getLanguageByKey("Restanță client")}
        placeholder={getLanguageByKey("Restanță client")}
        key={form.key("achitat_client")}
        {...form.getInputProps("achitat_client")}
      />
      <NumberInput
        disabled
        hideControls
        mt="md"
        label={`${getLanguageByKey("Comision companie")} €`}
        placeholder={`${getLanguageByKey("Comision companie")} €`}
        key={form.key("achitat_client")}
        {...form.getInputProps("achitat_client")}
      />

      <TextInput
        disabled
        mt="md"
        label={getLanguageByKey("Statut achitare")}
        placeholder={getLanguageByKey("Statut achitare")}
        key={form.key("tour_operator")}
        {...form.getInputProps("tour_operator")}
      />

      <LabelSwitch
        mt="md"
        label={getLanguageByKey("Control Admin")}
        key={form.key("control_admin")}
        {...form.getInputProps("control_admin")}
      />

      <Flex justify="end" gap="md" mt="md">
        <Button variant="default" onClick={() => onClose()}>
          {getLanguageByKey("Închide")}
        </Button>
        <Button loading={loading} type="submit">
          {getLanguageByKey("Trimite")}
        </Button>
      </Flex>
    </form>
  )
}

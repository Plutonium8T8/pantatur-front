import { TextInput, Select, NumberInput, Flex, Button } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { getLanguageByKey } from "../../utils"
import { LabelSwitch } from "../../LabelSwitch"
import { paymentStatusOptions } from "../../../FormOptions"
import { DD_MM_YYYY } from "../../../app-constants"
import dayjs from "dayjs"
import { DATE_TIME_FORMAT } from "../../../app-constants"

const formatDate = (date) => {
  return dayjs(date).format(DATE_TIME_FORMAT)
}

export const ContractTicketForm = ({ onClose, onSubmit, loading }) => {
  const form = useForm({
    mode: "uncontrolled",

    transformValues: ({
      data_contractului,
      data_avansului,
      data_de_plata_integrala,
      ...rest
    }) => {
      const formattedData = {
        ...(data_contractului && {
          data_contractului: formatDate(data_contractului)
        }),
        ...(data_avansului && { data_avansului: formatDate(data_avansului) }),
        ...(data_de_plata_integrala && {
          data_de_plata_integrala: formatDate(data_de_plata_integrala)
        })
      }

      return { ...formattedData, ...rest }
    }
  })

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        onSubmit(values, () => form.reset())
      })}
    >
      <TextInput
        mt="md"
        label={getLanguageByKey("Nr de contract")}
        placeholder={getLanguageByKey("Nr de contract")}
        key={form.key("numar_de_contract")}
        {...form.getInputProps("numar_de_contract")}
      />
      <DatePickerInput
        minDate={new Date()}
        valueFormat={DD_MM_YYYY}
        clearable
        mt="md"
        label={getLanguageByKey("Data contractului")}
        placeholder={getLanguageByKey("Data contractului")}
        key={form.key("data_contractului")}
        {...form.getInputProps("data_contractului")}
      />

      <DatePickerInput
        minDate={new Date()}
        valueFormat={DD_MM_YYYY}
        clearable
        mt="md"
        label={getLanguageByKey("Data avansului")}
        placeholder={getLanguageByKey("Data avansului")}
        key={form.key("data_avansului")}
        {...form.getInputProps("data_avansului")}
      />

      <DatePickerInput
        minDate={new Date()}
        valueFormat={DD_MM_YYYY}
        clearable
        mt="md"
        label={getLanguageByKey("Data de plată integrală")}
        placeholder={getLanguageByKey("Data de plată integrală")}
        key={form.key("data_de_plata_integrala")}
        {...form.getInputProps("data_de_plata_integrala")}
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
        mt="md"
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
        key={form.key("statutul_platii")}
        {...form.getInputProps("statutul_platii")}
      />

      <NumberInput
        hideControls
        mt="md"
        label={`${getLanguageByKey("Avans euro")} €`}
        placeholder={`${getLanguageByKey("Avans euro")} €`}
        key={form.key("avans_euro")}
        {...form.getInputProps("avans_euro")}
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
      />
      <NumberInput
        disabled
        hideControls
        mt="md"
        label={`${getLanguageByKey("Comision companie")} €`}
        placeholder={`${getLanguageByKey("Comision companie")} €`}
      />

      <TextInput
        disabled
        mt="md"
        label={getLanguageByKey("Statut achitare")}
        placeholder={getLanguageByKey("Statut achitare")}
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

import { Select, TextInput, Button, Flex } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { getLanguageByKey } from "../../utils"
import {
  sourceOfLeadOptions,
  promoOptions,
  marketingOptions,
  serviceTypeOptions,
  countryOptions,
  transportOptions,
  nameExcursionOptions,
  purchaseProcessingOptions
} from "../../../FormOptions"

export const TicketInfoForm = ({ onClose, onSubmit, loading }) => {
  const form = useForm({
    mode: "uncontrolled"
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form.getValues())
      }}
    >
      <TextInput
        label={`${getLanguageByKey("Vânzare")} €`}
        placeholder={getLanguageByKey("Indicați suma în euro")}
        key={form.key("buget")}
        {...form.getInputProps("buget")}
      />

      <DatePickerInput
        mt="md"
        label={getLanguageByKey("Data venit in oficiu")}
        placeholder={getLanguageByKey("Selectează data venirii în oficiu")}
        key={form.key("data_venit_in_oficiu")}
        {...form.getInputProps("data_venit_in_oficiu")}
      />

      <DatePickerInput
        mt="md"
        label={getLanguageByKey("Data și ora plecării")}
        placeholder={getLanguageByKey("Data și ora plecării")}
        key={form.key("data_plecarii")}
        {...form.getInputProps("data_plecarii")}
      />
      <DatePickerInput
        mt="md"
        label={getLanguageByKey("Data și ora întoarcerii")}
        placeholder={getLanguageByKey("Data și ora întoarcerii")}
        key={form.key("data_intoarcerii")}
        {...form.getInputProps("data_intoarcerii")}
      />

      <DatePickerInput
        mt="md"
        label={getLanguageByKey("Data cererii de retur")}
        placeholder={getLanguageByKey("Data cererii de retur")}
        key={form.key("data_cererii_de_retur")}
        {...form.getInputProps("data_cererii_de_retur")}
      />

      <Select
        disabled
        mt="md"
        label={getLanguageByKey("Status sunet telefonic")}
        placeholder={getLanguageByKey("Status sunet telefonic")}
        data={[]}
        clearable
        key={form.key("priority")}
        {...form.getInputProps("priority")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Sursă lead")}
        placeholder={getLanguageByKey("Sursă lead")}
        data={sourceOfLeadOptions}
        clearable
        key={form.key("sursa_lead")}
        {...form.getInputProps("sursa_lead")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Promo")}
        placeholder={getLanguageByKey("Promo")}
        data={promoOptions}
        clearable
        key={form.key("promo")}
        {...form.getInputProps("promo")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Marketing")}
        placeholder={getLanguageByKey("Marketing")}
        data={marketingOptions}
        clearable
        key={form.key("marketing")}
        {...form.getInputProps("marketing")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Serviciu")}
        placeholder={getLanguageByKey("Serviciu")}
        data={serviceTypeOptions}
        clearable
        key={form.key("tipul_serviciului")}
        {...form.getInputProps("tipul_serviciului")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Țară")}
        placeholder={getLanguageByKey("Țară")}
        data={countryOptions}
        clearable
        key={form.key("tara")}
        {...form.getInputProps("tara")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Transport")}
        placeholder={getLanguageByKey("Transport")}
        data={transportOptions}
        clearable
        key={form.key("tip_de_transport")}
        {...form.getInputProps("tip_de_transport")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Excursie")}
        placeholder={getLanguageByKey("Excursie")}
        data={nameExcursionOptions}
        clearable
        key={form.key("denumirea_excursiei_turului")}
        {...form.getInputProps("denumirea_excursiei_turului")}
      />

      <Select
        mt="md"
        label={getLanguageByKey("Achiziție")}
        placeholder={getLanguageByKey("Achiziție")}
        data={purchaseProcessingOptions}
        clearable
        key={form.key("procesarea_achizitionarii")}
        {...form.getInputProps("procesarea_achizitionarii")}
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

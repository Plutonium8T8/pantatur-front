import { Tabs } from "@mantine/core"
import { useSnackbar } from "notistack"
import { useState, useEffect } from "react"
import {
  getLanguageByKey,
  showServerError,
  cleanFormValues,
  pick
} from "../../utils"
import { api } from "../../../api"
import {
  TicketInfoForm,
  GeneralInfoTicketForm,
  ContractTicketForm
} from "../components"

export const EditBulkOrSingleLeadTabs = ({
  open,
  onClose,
  selectedTickets,
  fetchLeads,
  id
}) => {
  const { enqueueSnackbar } = useSnackbar()

  const [loading, setLoading] = useState(false)
  const [ticketInfo, setTicketInfo] = useState({})
  const [generalInfoLightTicket, setGeneralInfoLightTicket] = useState({})

  const submit = async (values, callback) => {
    setLoading(true)
    try {
      const formattedValues = cleanFormValues(values)
      if (!Object.keys(formattedValues).length) return

      await api.tickets.updateById({
        id: id ? [id] : selectedTickets,
        ...formattedValues
      })
      onClose(true)
      callback()
      enqueueSnackbar(
        getLanguageByKey("Datele au fost actualizate cu success"),
        {
          variant: "success"
        }
      )
      await fetchLeads()
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getTicketInfo = async (id) => {
      setLoading(true)
      try {
        const lightTicket = await api.tickets.ticket.getLightById(id)
        const ticketInfo = await api.tickets.ticket.getInfo(id)
        setGeneralInfoLightTicket(lightTicket)
        setTicketInfo(ticketInfo)
      } catch (error) {
        enqueueSnackbar(showServerError(error), { variant: "error" })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      getTicketInfo(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <Tabs defaultValue="general_info">
      <Tabs.List>
        <Tabs.Tab value="general_info">
          {getLanguageByKey("Informații generale")}
        </Tabs.Tab>
        <Tabs.Tab value="ticket_info">
          {getLanguageByKey("Informații despre tichet")}
        </Tabs.Tab>
        <Tabs.Tab value="contact">{getLanguageByKey("Contact")}</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="general_info" pt="xs">
        <GeneralInfoTicketForm
          data={pick(generalInfoLightTicket, [
            "workflow",
            "priority",
            "contact",
            "tags",
            "group_title",
            "technician_id",
            "description"
          ])}
          onClose={onClose}
          onSubmit={submit}
          loading={loading}
        />
      </Tabs.Panel>

      <Tabs.Panel value="ticket_info" pt="xs">
        <TicketInfoForm
          data={pick(ticketInfo, [
            "buget",
            "data_venit_in_oficiu",
            "data_plecarii",
            "data_intoarcerii",
            "data_cererii_de_retur",
            "sursa_lead",
            "promo",
            "marketing",
            "tipul_serviciului",
            "tara",
            "tip_de_transport",
            "denumirea_excursiei_turului",
            "procesarea_achizitionarii"
          ])}
          onClose={onClose}
          onSubmit={submit}
          loading={loading}
        />
      </Tabs.Panel>
      <Tabs.Panel value="contact" pt="xs">
        <ContractTicketForm
          data={pick(ticketInfo, [
            "numar_de_contract",
            "data_contractului",
            "data_avansului",
            "data_de_plata_integrala",
            "contract_trimis",
            "contract_semnat",
            "tour_operator",
            "numarul_cererii_de_la_operator",
            "achitare_efectuata",
            "rezervare_confirmata",
            "contract_arhivat",
            "statutul_platii",
            "avans_euro",
            "pret_netto",
            "achitat_client",
            "control"
          ])}
          onClose={onClose}
          onSubmit={submit}
          loading={loading}
        />
      </Tabs.Panel>
    </Tabs>
  )
}

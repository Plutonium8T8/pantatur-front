import { useState, useEffect } from "react"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { getLanguageByKey } from "../utils/getLanguageByKey"
import { priorityOptions } from "../../FormOptions/PriorityOption"
import { sourceOfLeadOptions } from "../../FormOptions/SourceOfLeadOptions"
import { promoOptions } from "../../FormOptions/PromoOptions"
import { marketingOptions } from "../../FormOptions/MarketingOptions"
import { countryOptions } from "../../FormOptions/CountryOptions"
import { transportOptions } from "../../FormOptions/TransportOptions"
import { nameExcursionOptions } from "../../FormOptions/NameExcursionOptions"
import { serviceTypeOptions } from "../../FormOptions/ServiceTypeOptions"
import { purchaseProcessingOptions } from "../../FormOptions/PurchaseProcessingOptions"
import { api } from "../../api"
import { useSnackbar } from "notistack"
import { showServerError } from "../utils/showServerError"
import { LabelInput } from "../LabelInput"

export const LeadCreationDate = ({
  handleInputChange,
  filters,
  handleMultiSelectChange
}) => {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true)
        const data = await api.users.getTechnicianList()

        const formattedTechnicians = data.map((item) =>
          `${item.id.id}: ${item.id.name} ${item.id.surname}`.trim()
        )

        setLoading(false)
        setTechnicians(formattedTechnicians)
      } catch (error) {
        enqueueSnackbar(showServerError(error), { variant: "error" })
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [])

  return (
    <div className="container-extra-group">
      <label>{getLanguageByKey("Data creare Lead")}</label>
      <input
        type="date"
        name="creation_date"
        value={filters.creation_date || ""}
        onChange={handleInputChange}
        className={filters.numar_de_contract ? "filled-field" : ""}
      />
      <label>{getLanguageByKey("Data ultima actualizare Lead")}</label>
      <input
        type="date"
        name="last_interaction_date"
        value={filters.last_interaction_date || ""}
        onChange={handleInputChange}
        className={filters.last_interaction_date ? "filled-field" : ""}
      />
      <label>{getLanguageByKey("Prioritate Lead")}</label>
      <CustomMultiSelect
        options={priorityOptions}
        placeholder={getLanguageByKey("Alege prioritatea")}
        onChange={(values) => handleMultiSelectChange("priority", values)}
        selectedValues={filters.priority}
      />
      <label>{getLanguageByKey("Responsabil Lead")}</label>
      <CustomMultiSelect
        options={technicians}
        loading={loading}
        placeholder={getLanguageByKey("Alege responsabil lead")}
        onChange={(values) => handleMultiSelectChange("technician_id", values)}
        selectedValues={filters.technician_id}
      />

      <label>{getLanguageByKey("Tag-uri")}</label>
      <LabelInput
        name="tags"
        value={filters.tags.length > 0 ? filters.tags.join(", ") : ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Introdu tag-uri separate prin virgule")}
      />
      <label>{getLanguageByKey("Sursa Lead")}</label>
      <CustomMultiSelect
        options={sourceOfLeadOptions}
        placeholder={getLanguageByKey("Alege sursa lead")}
        onChange={(values) => handleMultiSelectChange("sursa_lead", values)}
        selectedValues={filters.sursa_lead}
      />

      <label>{getLanguageByKey("Promo")}</label>
      <CustomMultiSelect
        options={promoOptions}
        placeholder={getLanguageByKey("Alege promo")}
        onChange={(values) => handleMultiSelectChange("promo", values)}
        selectedValues={filters.promo}
      />

      <label>{getLanguageByKey("Marketing")}</label>
      <CustomMultiSelect
        options={marketingOptions}
        placeholder={getLanguageByKey("Alege marketing")}
        onChange={(values) => handleMultiSelectChange("marketing", values)}
        selectedValues={filters.marketing}
      />

      <label>{getLanguageByKey("Tara")}</label>
      <CustomMultiSelect
        options={countryOptions}
        placeholder={getLanguageByKey("Alege tara")}
        onChange={(values) => handleMultiSelectChange("tara", values)}
        selectedValues={filters.tara}
      />

      <label>{getLanguageByKey("Transport")}</label>
      <CustomMultiSelect
        options={transportOptions}
        placeholder={getLanguageByKey("Alege transport")}
        onChange={(values) =>
          handleMultiSelectChange("tip_de_transport", values)
        }
        selectedValues={filters.tip_de_transport}
      />

      <label>{getLanguageByKey("Nume excursie")}</label>
      <CustomMultiSelect
        options={nameExcursionOptions}
        placeholder={getLanguageByKey("Alege excursie")}
        onChange={(values) =>
          handleMultiSelectChange("denumirea_excursiei_turului", values)
        }
        selectedValues={filters.denumirea_excursiei_turului}
      />

      <label>{getLanguageByKey("Data vizita in oficiu")}</label>
      <input
        type="datetime-local"
        name="data_venit_in_oficiu"
        value={filters.data_venit_in_oficiu || ""}
        onChange={handleInputChange}
        className={filters.data_venit_in_oficiu ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Data plecării")}</label>
      <input
        type="datetime-local"
        name="data_plecarii"
        value={filters.data_plecarii || ""}
        onChange={handleInputChange}
        className={filters.data_plecarii ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Data întoarcerii")}</label>
      <input
        type="datetime-local"
        name="data_intoarcerii"
        value={filters.data_intoarcerii || ""}
        onChange={handleInputChange}
        className={filters.data_intoarcerii ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Vânzare")} €</label>
      <LabelInput
        type="number"
        name="buget"
        value={filters.buget || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Indicați suma în euro")}
      />

      <label>{getLanguageByKey("Tipul serviciului")}</label>
      <CustomMultiSelect
        options={serviceTypeOptions}
        placeholder={getLanguageByKey("Alege serviciu")}
        onChange={(values) =>
          handleMultiSelectChange("tipul_serviciului", values)
        }
        selectedValues={filters.tipul_serviciului}
      />

      <label>{getLanguageByKey("Procesare achizitionarii")}</label>
      <CustomMultiSelect
        options={purchaseProcessingOptions}
        placeholder={getLanguageByKey("Alege achiziție")}
        onChange={(values) =>
          handleMultiSelectChange("procesarea_achizitionarii", values)
        }
        selectedValues={filters.procesarea_achizitionarii}
      />

      <label>{getLanguageByKey("Data cererii de retur")}</label>
      <input
        type="datetime-local"
        name="data_cererii_de_retur"
        value={filters.data_cererii_de_retur || ""}
        onChange={handleInputChange}
        className={filters.data_cererii_de_retur ? "filled-field" : ""}
      />
    </div>
  )
}

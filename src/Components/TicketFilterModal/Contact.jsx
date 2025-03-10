import { getLanguageByKey } from "../utils/getLanguageByKey"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { paymentStatusOptions } from "../../FormOptions/PaymentStatusOptions"
import ToggleComponent from "../../Components/ToggleComponent/ToggleSwitch"
import { LabelInput } from "../LabelInput"

export const Contact = ({
  filters,
  handleInputChange,
  handleMultiSelectChange,
  onFilters
}) => {
  return (
    <div className="container-extra-group">
      <h3>{getLanguageByKey("Contract")}</h3>

      <label>{getLanguageByKey("Nr de contract")}</label>
      <LabelInput
        name="numar_de_contract"
        value={filters.numar_de_contract || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Nr de contract")}
      />

      <label>{getLanguageByKey("Data contractului")}</label>
      <input
        type="datetime-local"
        name="data_contractului"
        value={filters.data_contractului || ""}
        onChange={handleInputChange}
      />
      <ToggleComponent
        label={getLanguageByKey("Contract trimis")}
        checked={Boolean(filters.contract_trimis)}
        onChange={(value) => onFilters("contract_trimis", value)}
      />

      <ToggleComponent
        label={getLanguageByKey("Contract semnat")}
        checked={Boolean(filters.contract_semnat)}
        onChange={(value) => onFilters("contract_semnat", value)}
      />

      <label>{getLanguageByKey("Operator turistic")}</label>
      <LabelInput
        name="tour_operator"
        value={filters.tour_operator || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Operator turistic")}
      />

      <label>{getLanguageByKey("Nr cererii de la operator")}</label>
      <LabelInput
        name="numarul_cererii_de_la_operator"
        value={filters.numarul_cererii_de_la_operator || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Nr cererii de la operator")}
      />

      <ToggleComponent
        label={getLanguageByKey("Achitare efectuată")}
        checked={Boolean(filters.achitare_efectuata)}
        onChange={(value) => onFilters("achitare_efectuata", value)}
      />

      <ToggleComponent
        label={getLanguageByKey("Rezervare confirmată")}
        checked={Boolean(filters.rezervare_confirmata)}
        onChange={(value) => onFilters("rezervare_confirmata", value)}
      />

      <ToggleComponent
        label={getLanguageByKey("Contract arhivat")}
        checked={Boolean(filters.contract_arhivat)}
        onChange={(value) => onFilters("contract_arhivat", value)}
      />

      <label>{getLanguageByKey("Plată primită")}</label>
      <CustomMultiSelect
        options={paymentStatusOptions}
        placeholder={getLanguageByKey("Selectează statutul plății")}
        onChange={(values) =>
          handleMultiSelectChange("statutul_platii", values)
        }
        selectedValues={filters.statutul_platii}
      />

      <label>{getLanguageByKey("Avans în euro")} €</label>
      <LabelInput
        type="number"
        name="avans_euro"
        value={filters.avans_euro || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Avans în euro")}
      />

      <label>{getLanguageByKey("Data avansului")}</label>
      <input
        type="datetime-local"
        name="data_avansului"
        value={filters.data_avansului || ""}
        onChange={handleInputChange}
      />

      <label>{getLanguageByKey("Data de plată integrală")}</label>
      <input
        type="datetime-local"
        name="data_de_plata_integrala"
        value={filters.data_de_plata_integrala || ""}
        onChange={handleInputChange}
      />

      <label>{getLanguageByKey("Preț NETTO")} €</label>
      <LabelInput
        type="number"
        name="pret_netto"
        value={filters.pret_netto || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Preț NETTO")}
      />

      <label>{getLanguageByKey("Achitat client")}</label>
      <LabelInput
        type="number"
        name="achitat_client"
        value={filters.achitat_client || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Achitat client")}
      />

      <label>{getLanguageByKey("Comisionul companiei")} €</label>
      <LabelInput
        type="number"
        name="comission_companie"
        value={filters.comission_companie || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Comisionul companiei")}
      />

      <ToggleComponent
        label={getLanguageByKey("Control Admin")}
        checked={Boolean(filters.control_admin)}
        onChange={(value) => onFilters("control_admin", value)}
      />
    </div>
  )
}

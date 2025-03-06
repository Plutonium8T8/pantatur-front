import { getLanguageByKey } from "../utils/getLanguageByKey"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { paymentStatusOptions } from "../../FormOptions/PaymentStatusOptions"
import ToggleComponent from "../../Components/ToggleComponent/ToggleSwitch"

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
      <input
        type="text"
        name="numar_de_contract"
        value={filters.numar_de_contract || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Nr de contract")}
        className={filters.numar_de_contract ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Data contractului")}</label>
      <input
        type="datetime-local"
        name="data_contractului"
        value={filters.data_contractului || ""}
        onChange={handleInputChange}
        className={filters.data_contractului ? "filled-field" : ""}
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
      <input
        type="text"
        name="tour_operator"
        value={filters.tour_operator || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Operator turistic")}
        className={filters.tour_operator ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Nr cererii de la operator")}</label>
      <input
        type="text"
        name="numarul_cererii_de_la_operator"
        value={filters.numarul_cererii_de_la_operator || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Nr cererii de la operator")}
        className={filters.numarul_cererii_de_la_operator ? "filled-field" : ""}
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
      <input
        type="number"
        name="avans_euro"
        value={filters.avans_euro || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Plată primită")}
        className={filters.avans_euro ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Data avansului")}</label>
      <input
        type="datetime-local"
        name="data_avansului"
        value={filters.data_avansului || ""}
        onChange={handleInputChange}
        className={filters.data_avansului ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Data de plată integrală")}</label>
      <input
        type="datetime-local"
        name="data_de_plata_integrala"
        value={filters.data_de_plata_integrala || ""}
        onChange={handleInputChange}
        className={filters.data_de_plata_integrala ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Preț NETTO")} €</label>
      <input
        type="number"
        name="pret_netto"
        value={filters.pret_netto || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Preț NETTO")}
        className={filters.pret_netto ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Achitat client")}</label>
      <input
        type="number"
        name="achitat_client"
        value={filters.achitat_client || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Achitat client")}
        className={filters.achitat_client ? "filled-field" : ""}
      />

      <label>{getLanguageByKey("Comisionul companiei")} €</label>
      <input
        type="number"
        name="comission_companie"
        value={filters.comission_companie || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Comisionul companiei")}
        className={filters.comission_companie ? "filled-field" : ""}
      />

      <ToggleComponent
        label={getLanguageByKey("Control Admin")}
        checked={Boolean(filters.control_admin)}
        onChange={(value) => onFilters("control_admin", value)}
      />
    </div>
  )
}

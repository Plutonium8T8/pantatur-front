import { getLanguageByKey } from "../utils/getLanguageByKey"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { valutaOptions } from "../../FormOptions/ValutaOptions"
import { ibanOptions } from "../../FormOptions/IbanOptions"
import { Input } from "../Input"

export const Invoice = ({
  filters,
  handleInputChange,
  handleMultiSelectChange
}) => {
  return (
    <div className="container-extra-group">
      <h2>{getLanguageByKey("Invoice")}</h2>

      <label>{getLanguageByKey("F/service")}</label>
      <Input
        name="f_serviciu"
        value={filters.f_serviciu || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("F/service")}
      />

      <label>{getLanguageByKey("F/factura")}</label>
      <Input
        name="f_factura"
        value={filters.f_factura || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("F/factura")}
      />

      <label>{getLanguageByKey("F/numarul")}</label>
      <Input
        type="number"
        name="f_numarul"
        value={filters.f_numarul || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("F/numarul")}
      />

      <label>{getLanguageByKey("F/preț")}</label>
      <Input
        type="number"
        name="f_pret"
        value={filters.f_pret || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("F/preț")}
      />

      <label>{getLanguageByKey("F/sumă")}</label>
      <Input
        type="number"
        name="f_suma"
        value={filters.f_suma || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("F/sumă")}
      />

      <label>{getLanguageByKey("Valuta contului")}</label>
      <CustomMultiSelect
        options={valutaOptions}
        placeholder={getLanguageByKey("Selectează valuta contului")}
        onChange={(values) =>
          handleMultiSelectChange("valuta_contului", values)
        }
        selectedValues={filters.valuta_contului}
      />

      <label>IBAN</label>
      <CustomMultiSelect
        options={ibanOptions}
        placeholder={getLanguageByKey("Selectează IBAN")}
        onChange={(values) => handleMultiSelectChange("iban", values)}
        selectedValues={filters.iban}
      />
    </div>
  )
}

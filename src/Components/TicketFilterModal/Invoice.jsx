import { getLanguageByKey } from "../utils/getLanguageByKey"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect";
import { valutaOptions } from "../../FormOptions/ValutaOptions";
import { ibanOptions } from "../../FormOptions/IbanOptions";


export const Invoice = ({filters, handleInputChange, handleMultiSelectChange}) => {
    return (
      <div  className="container-extra-group">
        <h3>{getLanguageByKey("Invoice")}</h3>
  
        <label>{getLanguageByKey("F/service")}</label>
        <input
          type="text"
          name="f_serviciu"
          value={filters.f_serviciu || ""}
          onChange={handleInputChange}
          placeholder={getLanguageByKey("F/service")}
          className={filters.f_serviciu ? "filled-field" : ""}
        />
  
        <label>{getLanguageByKey("F/factura")}</label>
        <input
          type="text"
          name="f_factura"
          value={filters.f_factura || ""}
          onChange={handleInputChange}
          placeholder={getLanguageByKey("F/factura")}
          className={filters.f_factura ? "filled-field" : ""}
        />
  
        <label>{getLanguageByKey("F/numarul")}</label>
        <input
          type="number"
          name="f_numarul"
          value={filters.f_numarul || ""}
          onChange={handleInputChange}
          placeholder={getLanguageByKey("F/numarul")}
          className={filters.f_numarul ? "filled-field" : ""}
        />
  
        <label>{getLanguageByKey("F/preț")}</label>
        <input
          type="number"
          name="f_pret"
          value={filters.f_pret || ""}
          onChange={handleInputChange}
          placeholder={getLanguageByKey("F/preț")}
          className={filters.f_pret ? "filled-field" : ""}
        />
  
        <label>{getLanguageByKey("F/sumă")}</label>
        <input
          type="number"
          name="f_suma"
          value={filters.f_suma || ""}
          onChange={handleInputChange}
          placeholder={getLanguageByKey("F/sumă")}
          className={filters.f_suma ? "filled-field" : ""}
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
    );
  };
  
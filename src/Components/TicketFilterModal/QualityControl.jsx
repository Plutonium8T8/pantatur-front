import { getLanguageByKey } from "../utils/getLanguageByKey"
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"
import { motivulRefuzuluiOptions } from "../../FormOptions/MotivulRefuzuluiOptions"
import { evaluareOdihnaOptions } from "../../FormOptions/EvaluareVacantaOptions"
import { LabelInput } from "../LabelInput"

export const QualityControl = ({
  handleMultiSelectChange,
  handleInputChange,
  filters
}) => {
  return (
    <div className="container-extra-group">
      <h3>{getLanguageByKey("Control calitate")}</h3>

      <label>{getLanguageByKey("Motivul refuzului")}</label>
      <CustomMultiSelect
        options={motivulRefuzuluiOptions}
        placeholder={getLanguageByKey("Motivul refuzului")}
        onChange={(values) =>
          handleMultiSelectChange("motivul_refuzului", values)
        }
        selectedValues={filters.motivul_refuzului}
      />
      <label>{getLanguageByKey("Evaluare odihnă")}</label>
      <CustomMultiSelect
        options={evaluareOdihnaOptions}
        placeholder={getLanguageByKey("Evaluare odihnă")}
        onChange={(values) =>
          handleMultiSelectChange("evaluare_de_odihna", values)
        }
        selectedValues={filters.evaluare_de_odihna}
      />
      <label htmlFor="id">{getLanguageByKey("Următoarea vacanță")}</label>
      <LabelInput
        id="id"
        name="urmatoarea_vacanta"
        value={filters.urmatoarea_vacanta || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Următoarea vacanță")}
      />
      <label>{getLanguageByKey("Manager")}</label>
      <LabelInput
        name="manager"
        value={filters.manager || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Manager")}
      />
      <label>{getLanguageByKey("Vacanța")}</label>
      <LabelInput
        name="vacanta"
        value={filters.vacanta || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Vacanța")}
      />
    </div>
  )
}

import { getLanguageByKey } from "../utils/getLanguageByKey";
import CustomMultiSelect from "../MultipleSelect/MultipleSelect";
import { motivulRefuzuluiOptions } from "../../FormOptions/MotivulRefuzuluiOptions";
import { evaluareOdihnaOptions } from "../../FormOptions/EvaluareVacantaOptions";

export const QualityControl = ({
  handleMultiSelectChange,
  handleInputChange,
  filters,
}) => {
  return (
    <div  className="container-extra-group">
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
      <input
        id="id"
        type="text"
        name="urmatoarea_vacanta"
        value={filters.urmatoarea_vacanta || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Următoarea vacanță")}
        className={filters.urmatoarea_vacanta ? "filled-field" : ""}
      />
      <label>{getLanguageByKey("Manager")}</label>
      <input
        type="text"
        name="manager"
        value={filters.manager || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Manager")}
        className={filters.manager ? "filled-field" : ""}
      />
      <label>{getLanguageByKey("Vacanța")}</label>
      <input
        type="text"
        name="vacanta"
        value={filters.vacanta || ""}
        onChange={handleInputChange}
        placeholder={getLanguageByKey("Vacanța")}
        className={filters.vacanta ? "filled-field" : ""}
      />
    </div>
  );
};

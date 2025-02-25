import {getLanguageByKey} from "../../Components/utils/getTranslationByKey"

export const showServerError = (error) => {
    return error?.response?.data?.message || getLanguageByKey("Eroare neașteptată, încercați mai târziu")
}
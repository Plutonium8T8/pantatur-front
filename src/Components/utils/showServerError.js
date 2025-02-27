import {getLanguageByKey} from "../../Components/utils/getTranslationByKey"

export const showServerError = (error) => {
    const serverMessage = error?.response?.data

    return serverMessage?.message || serverMessage?.error  || getLanguageByKey("Eroare neașteptată, încercați mai târziu")
}

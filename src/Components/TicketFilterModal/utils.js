import { workflowOptions } from "../../FormOptions/WorkFlowOption";

export const platformOptions = [
    "telegram",
    "viber",
    "whatsapp",
    "facebook",
    "instagram",
    "sipuni",
  ];
  
  export const filterGroups = {
      General: ["workflow"],
      Ticket: [
        "creation_date",
        "last_interaction_date",
        "priority",
        "technician_id",
        "tags",
        "tipul_serviciului",
        "tara",
        "tip_de_transport",
        "denumirea_excursiei_turului",
        "procesarea_achizitionarii",
        "data_venit_in_oficiu",
        "data_plecarii",
        "data_intoarcerii",
        "data_cererii_de_retur",
        "buget",
        "sursa_lead",
        "status_sunet_telefonic",
        "promo",
        "marketing",
      ],
      Messages: ["platform"],
    };



    export   const filterDefaults = {
        workflow: workflowOptions.filter(
          (wf) => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat",
        ),
        tags: [],
      };
import { getLanguageByKey } from "../../utils/getTranslationByKey";
import TicketRow from "../TicketRowComponent";

const LeadTable = ({
  filteredTickets,
  selectedTickets,
  setCurrentTicket,
  toggleSelectTicket,
}) => {
  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>{getLanguageByKey("Verificare")}</th>
          <th>ID</th>
          <th>{getLanguageByKey("Contact")}</th>
          <th>{getLanguageByKey("Nume")}</th>
          <th>{getLanguageByKey("Prenume")}</th>
          <th>{getLanguageByKey("Email")}</th>
          <th>{getLanguageByKey("Telefon")}</th>
          <th>{getLanguageByKey("Descriere")}</th>
          <th>{getLanguageByKey("Tag-uri")}</th>
          <th>{getLanguageByKey("Prioritate")}</th>
          <th>{getLanguageByKey("Workflow")}</th>
        </tr>
      </thead>
      <tbody>
        {filteredTickets.map((ticket) => (
          <TicketRow
            key={ticket.id}
            ticket={ticket}
            isSelected={selectedTickets.includes(ticket.id)}
            onSelect={toggleSelectTicket}
            onEditTicket={setCurrentTicket}
          />
        ))}
      </tbody>
    </table>
  );
};

export default LeadTable;

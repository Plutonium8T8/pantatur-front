import { GoArchive } from "react-icons/go"
import "./Empty.css"

export const Empty = () => {
  return (
    <div className="empty | d-flex justify-content-center align-items-center flex-column">
      <div className="mb-16">
        <GoArchive size={64} />
      </div>

      <div className="no-data">NO DATA</div>
    </div>
  )
}

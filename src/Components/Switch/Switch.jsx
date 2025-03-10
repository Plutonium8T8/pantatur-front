import "./Switch.css"

export const Switch = ({ checked, onChange }) => {
  return (
    <>
      <input
        className="input-switch"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="slider round"></span>
    </>
  )
}

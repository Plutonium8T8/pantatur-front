import "./Spin.css"

export const Spin = ({ width = 46, height = 46, border = 4 }) => {
  return (
    <div
      className="spin"
      style={{
        "--width": `${width}px`,
        "--height": `${height}px`,
        "--border": `${border}px`
      }}
    />
  )
}

import './GeneratingLoader.css'

interface Props {
  size?: number
  text?: string
}

export function GeneratingLoader({ size = 200, text = 'Generating' }: Props) {
  return (
    <div className="orb-bg">
      <div className="orb-container" style={{ width: size, height: size }}>
        {text.split('').map((letter, i) => (
          <span
            key={i}
            className="orb-letter"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {letter}
          </span>
        ))}
        <div className="orb-circle" />
      </div>
    </div>
  )
}

interface AlertProps {
  title: string
  color: "alert" | "success" | "info" | "warning"
}

export default function Alert({ title, color }: AlertProps) {
  const colorClasses = {
    alert: "bg-red-500 text-white",
    success: "bg-green-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-black",
  }

  const selectedColorClass = colorClasses[color] || colorClasses.info

  return (
    <div
      role="alert"
      className={`w-lg max-w-fit rounded-lg p-4 ${selectedColorClass} flex gap-2 text-sm`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-info h-4 w-4"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
      </svg>
      <h5 className="leading-none tracking-tight">{title}</h5>
    </div>
  )
}
